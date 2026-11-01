require('dotenv').config();
const express=require('express'),mysql=require('mysql2/promise'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),crypto=require('crypto'),helmet=require('helmet'),cors=require('cors');
const app=express();
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw Error('Configure a random JWT_SECRET before starting.');
const db=mysql.createPool({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3307),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,connectionLimit:8});
app.use(helmet());
app.use('/api/admin/site-assets',express.json({limit:'4mb'}));
app.use('/api/admin/site-content',express.json({limit:'1mb'}));
app.use(express.json({limit:'100kb'}));
app.use(cors({origin:['http://localhost:5180','http://localhost:5181','http://127.0.0.1:5180','http://127.0.0.1:5181']}));
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const error=(status,message)=>Object.assign(new Error(message),{status});
const clean=(v,max=190)=>typeof v==='string'?v.trim().slice(0,max):'';
const reference=()=> 'APP'+new Date().getFullYear()+crypto.randomBytes(12).toString('hex').toUpperCase();
const password=()=>crypto.randomBytes(15).toString('base64url')+'Aa1!';
const emailValid=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const auth=wrap(async(req,res,next)=>{let token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];if(!token)throw error(401,'Please sign in.');let payload;try{payload=jwt.verify(token,process.env.JWT_SECRET,{algorithms:['HS256']})}catch{throw error(401,'Your session expired. Please sign in again.')}const [rows]=await db.execute('SELECT id,email,username,full_name,role,must_change_password FROM users WHERE id=? AND is_active=TRUE',[payload.id]);if(!rows.length)throw error(401,'Account not available.');req.user=rows[0];next()});
const admin=(req,res,next)=>req.user.role==='admin'?next():next(error(403,'Administrator access required.'));
const loginAttempts=new Map();
app.get('/api/health',wrap(async(req,res)=>{await cms.ready;await db.query('SELECT 1');res.json({success:true,service:'sepo-college-local',database:'connected'})}));
app.post('/api/auth/login',wrap(async(req,res)=>{
 const key=req.ip,now=Date.now(),entry=loginAttempts.get(key);if(entry&&now-entry.since<600000&&entry.count>=15)throw error(429,'Too many attempts. Try again in ten minutes.');
 const name=clean(req.body.username).toLowerCase();if(!name||typeof req.body.password!=='string')throw error(400,'Enter your username and password.');
 const [rows]=await db.execute('SELECT u.*,s.student_number FROM users u LEFT JOIN students s ON s.user_id=u.id WHERE (u.email=? OR u.username=? OR s.student_number=?) AND u.is_active=TRUE',[name,name,name]);
 if(!rows.length||!await bcrypt.compare(req.body.password,rows[0].password)){loginAttempts.set(key,{since:entry&&now-entry.since<600000?entry.since:now,count:entry&&now-entry.since<600000?entry.count+1:1});throw error(401,'Invalid username or password.')}
 loginAttempts.delete(key);const {password:hash,...user}=rows[0];res.json({success:true,token:jwt.sign({id:user.id},process.env.JWT_SECRET,{algorithm:'HS256',expiresIn:'8h'}),user});
}));
app.get('/api/auth/me',auth,wrap(async(req,res)=>{const [rows]=await db.execute('SELECT * FROM students WHERE user_id=?',[req.user.id]);res.json({success:true,user:req.user,student:rows[0]||null})}));
app.put('/api/auth/change-password',auth,wrap(async(req,res)=>{const {current_password,new_password}=req.body;if(typeof new_password!=='string'||new_password.length<12)throw error(400,'Use a password of at least 12 characters.');const [rows]=await db.execute('SELECT password FROM users WHERE id=?',[req.user.id]);if(typeof current_password!=='string'||!await bcrypt.compare(current_password,rows[0].password))throw error(400,'Current password is incorrect.');await db.execute('UPDATE users SET password=?,must_change_password=FALSE WHERE id=?',[await bcrypt.hash(new_password,12),req.user.id]);res.json({success:true})}));
app.post('/api/applications',wrap(async(req,res)=>{
 const b=req.body,full_name=clean(b.full_name),email=clean(b.email).toLowerCase(),phone=clean(b.phone,40),course=clean(b.intended_course),dob=clean(b.date_of_birth,10);
 if(!full_name||!emailValid(email)||!/^[+\d ()-]{7,25}$/.test(phone)||!/^\d{4}-\d{2}-\d{2}$/.test(dob)||!Number.isFinite(Date.parse(dob))||Date.parse(dob)>=Date.now())throw error(400,'Enter valid personal details, date of birth, email and phone number.');
 const year=Number(b.planned_year),current=new Date().getFullYear();if(!Number.isInteger(year)||year<current||year>current+3||!['full-time','part-time','online'].includes(b.study_mode))throw error(400,'Choose a valid planned year and study mode.');
 const [courses]=await db.execute('SELECT id FROM courses WHERE name=?',[course]);if(!courses.length)throw error(400,'Choose a programme from the catalogue.');
 const ref=reference();await db.execute('INSERT INTO applications(application_number,full_name,email,phone,date_of_birth,id_number,nationality,address,highest_qualification,institution,year_completed,results,intended_course,planned_year,study_mode) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[ref,full_name,email,phone,dob,clean(b.id_number,100),clean(b.nationality,100),clean(b.address,500),clean(b.highest_qualification,100),clean(b.institution),b.year_completed?Number(b.year_completed):null,clean(b.results,500),course,year,b.study_mode]);
 res.status(201).json({success:true,application_number:ref});
}));
app.get('/api/applications/check/:application_number',wrap(async(req,res)=>{
 const email=clean(req.query.email).toLowerCase();if(!emailValid(email))throw error(400,'Enter the email used for the application.');
 const [rows]=await db.execute('SELECT application_number,status,intended_course,created_at FROM applications WHERE application_number=? AND email=?',[clean(req.params.application_number,64),email]);if(!rows.length)throw error(404,'No matching application was found.');res.json({success:true,application:rows[0]});
}));
app.get('/api/courses',wrap(async(req,res)=>{await cms.ready;const [rows]=await db.query('SELECT * FROM courses WHERE is_active=TRUE ORDER BY school,name');res.json({success:true,courses:rows})}));
app.get('/api/admin/applications',auth,admin,wrap(async(req,res)=>{const [rows]=await db.query('SELECT * FROM applications ORDER BY created_at DESC LIMIT 500');res.json({success:true,applications:rows})}));
app.get('/api/admin/students',auth,admin,wrap(async(req,res)=>{const [rows]=await db.query('SELECT s.*,u.full_name,u.email,u.moodle_id FROM students s JOIN users u ON u.id=s.user_id ORDER BY s.id DESC');res.json({success:true,students:rows})}));
app.patch('/api/admin/applications/:id/status',auth,admin,wrap(async(req,res)=>{
 const status=req.body.status;if(!['reviewed','accepted','rejected'].includes(status))throw error(400,'Choose a valid status.');
 const conn=await db.getConnection();let credentials=null;
 try{await conn.beginTransaction();const [rows]=await conn.execute('SELECT * FROM applications WHERE id=? FOR UPDATE',[req.params.id]);if(!rows.length)throw error(404,'Application not found.');const a=rows[0];
 if(a.student_id&&status!=='accepted')throw error(409,'This application already has a student account. Manage the student account separately.');
 let studentId=a.student_id;
 if(status==='accepted'&&!studentId){
 const [existing]=await conn.execute('SELECT id FROM users WHERE email=?',[a.email]);if(existing.length)throw error(409,'An account already uses this email. Contact the administrator to resolve the duplicate.');
 const studentNumber='SEPO'+new Date().getFullYear()+crypto.randomBytes(4).toString('hex').toUpperCase(),temp=password();
 const [u]=await conn.execute('INSERT INTO users(email,username,password,full_name,role) VALUES(?,?,?,?,?)',[a.email,studentNumber.toLowerCase(),await bcrypt.hash(temp,12),a.full_name,'student']);
 const [s]=await conn.execute('INSERT INTO students(user_id,student_number,programme,study_mode,planned_year) VALUES(?,?,?,?,?)',[u.insertId,studentNumber,a.intended_course,a.study_mode,a.planned_year]);studentId=s.insertId;
 credentials={student_number:studentNumber,email:a.email,temporary_password:temp};
 }
 await conn.execute('UPDATE applications SET status=?,notes=?,student_id=? WHERE id=?',[status,clean(req.body.notes,2000),studentId,a.id]);await conn.commit();res.json({success:true,credentials,student_id:studentId});
 }catch(e){await conn.rollback();throw e}finally{conn.release()}
}));
app.get('/api/students/me',auth,wrap(async(req,res)=>{const [students]=await db.execute('SELECT * FROM students WHERE user_id=?',[req.user.id]);if(!students.length)throw error(404,'Student record not found.');const [enrollments]=await db.execute('SELECT e.*,c.name,c.code,c.school FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.student_id=?',[students[0].id]);res.json({success:true,student:students[0],enrollments})}));
app.post('/api/students/me/register',auth,wrap(async(req,res)=>{
 if(req.user.must_change_password)throw error(403,'Change your temporary password before registering.');
 if(!Array.isArray(req.body.course_ids))throw error(400,'Select valid courses.');
 const ids=[...new Set(req.body.course_ids)];if(!ids.length||ids.length>26||ids.some(id=>!Number.isInteger(id)))throw error(400,'Select valid courses.');
 const conn=await db.getConnection();try{await conn.beginTransaction();const [students]=await conn.execute('SELECT * FROM students WHERE user_id=? FOR UPDATE',[req.user.id]);if(!students.length)throw error(404,'Student record not found.');
 for(const id of ids){const [courses]=await conn.execute('SELECT id FROM courses WHERE id=? AND is_active=TRUE',[id]);if(!courses.length)throw error(400,'A selected course is unavailable.');await conn.execute('INSERT IGNORE INTO enrollments(student_id,course_id) VALUES(?,?)',[students[0].id,id]);}
 await conn.commit();res.json({success:true,message:'Registration saved.'})}catch(e){await conn.rollback();throw e}finally{conn.release()}
}));
app.post('/api/admin/students/:id/moodle',auth,admin,wrap(async(req,res)=>res.json(await require('./moodle-service.cjs').syncStudent(db,req.params.id))));
const cms=require('./site-cms.cjs').install(app,{db,auth,admin,wrap});
app.use('/api',(req,res)=>res.status(404).json({success:false,error:'Endpoint not found.'}));
app.use((err,req,res,next)=>{if(err.code)console.error('Database request failed:',err.code);res.status(err.status||500).json({success:false,error:err.status?err.message:'The request could not be completed. Please try again.'})});
if(require.main===module)Promise.all([db.query('SELECT 1'),cms.ready]).then(()=>app.listen(Number(process.env.PORT||5000),process.env.HOST||'127.0.0.1',()=>console.log('College API ready at http://localhost:'+(process.env.PORT||5000)))).catch(e=>{console.error('Database unavailable:',e.code);process.exitCode=1});
module.exports={app,db};
