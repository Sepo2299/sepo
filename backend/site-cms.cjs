const fs=require('fs'),path=require('path'),crypto=require('crypto'),express=require('express');
const copy=require('../frontend/src/site-copy.json'),schools=require('../frontend/src/schools.json');
const photos={science:'photo-1532094349884-543bc11b234d',computers:'photo-1516321318423-f06f85e504b3',automotive:'photo-1486262715619-67b85e0b08d3',entertainment:'photo-1485846234645-a62644f84728'};
const defaults={...copy,schools:schools.map(s=>({...s,image:'https://images.unsplash.com/'+photos[s.id]+'?auto=format&fit=crop&w=1200&q=80',courses:s.courses.map((c,i)=>({...c,code:s.id.toUpperCase().slice(0,3)+(i+101)}))}))};
const fail=(message,status=400)=>Object.assign(Error(message),{status});
const parse=v=>typeof v==='string'?JSON.parse(v):v;
function text(v,label,max=500,optional=false){if(typeof v!=='string'||v.length>max||(!optional&&!v.trim()))throw fail(label+' is required and must be under '+max+' characters.');return v.trim()}
function image(v){v=text(v,'Image address',2000);if(/^\/(?:images|api\/site-assets)\/[a-zA-Z0-9._/-]+\.(?:png|jpg|jpeg|webp)(?:\?.*)?$/i.test(v)&&!v.includes('..'))return v;let u;try{u=new URL(v)}catch{}if(!u||u.protocol!=='https:'||u.username||u.password)throw fail('Use an uploaded image or a valid HTTPS image address.');return v}
function route(v,optional=false){v=text(v,'Page link',200,optional);if(!v&&optional)return '';if(!/^\/(?:schools(?:\/(?:science|computers|automotive|entertainment))?|about|admissions|contact|kiosk|elearning|student-portal)?(?:#[a-zA-Z0-9_-]+)?$/.test(v))throw fail('Choose a page within the college website.');return v}
function email(v){v=text(v,'Email',190);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))throw fail('Enter a valid contact email.');return v}
function validate(input){
 if(!input||typeof input!=='object')throw fail('Website content is required.');
 const b=input.brand,h=input.home,c=input.contact;if(!b||!h||!c)throw fail('Complete the website identity, homepage and contact settings.');
 const result={brand:{name:text(b.name,'College name',100),subtitle:text(b.subtitle,'College subtitle',140),logo:image(b.logo),tagline:text(b.tagline,'Footer text',250)},
 home:{schoolHeading:text(h.schoolHeading,'Schools heading',150),introHeading:text(h.introHeading,'Introduction heading',150),introAccent:text(h.introAccent,'Introduction second heading',150),introText:text(h.introText,'Introduction paragraph',1500),introText2:text(h.introText2,'Introduction second paragraph',1500),introImage:image(h.introImage)},
 contact:{location:text(c.location,'Location',190),admissions:email(c.admissions),students:email(c.students),general:email(c.general)}};
 if(!Array.isArray(input.slides)||!input.slides.length||input.slides.length>8)throw fail('Use between one and eight homepage slides.');
 result.slides=input.slides.map((s,i)=>({id:text(s.id,'Slide ID',80),title:text(s.title,'Slide '+(i+1)+' heading',150),accent:text(s.accent,'Slide second heading',150),text:text(s.text,'Slide description',500),label:text(s.label,'Slide button text',80),to:route(s.to),image:image(s.image),alt:text(s.alt,'Image description',250),tag:text(s.tag,'Slide caption',160)}));
 if(new Set(result.slides.map(s=>s.id)).size!==result.slides.length)throw fail('Slide identifiers must be unique.');
 if(!Array.isArray(input.schools)||input.schools.length!==4)throw fail('Keep the four college schools.');
 const names=new Set(),codes=new Set(),ids=new Set();
 result.schools=input.schools.map(s=>{
 if(!schools.some(v=>v.id===s.id)||ids.has(s.id))throw fail('School identities must be unique.');ids.add(s.id);
 if(!Array.isArray(s.courses)||!s.courses.length||s.courses.length>40)throw fail('Each school needs between one and forty programmes.');
 if(!Array.isArray(s.facilities)||s.facilities.length>20)throw fail('Use up to twenty facilities per school.');
 return {id:s.id,name:text(s.name,'School name',100),description:text(s.description,'School description',1500),requirements:text(s.requirements,'Entry requirements',1000),email:email(s.email),image:image(s.image),facilities:s.facilities.map(f=>text(f,'Facility',160)),courses:s.courses.map(c=>{
 const name=text(c.name,'Programme name',190),code=text(c.code,'Programme code',40);
 if(!/^[A-Z0-9_-]{3,40}$/.test(code)||codes.has(code)||names.has(name.toLowerCase()))throw fail('Programme names and codes must be unique.');codes.add(code);names.add(name.toLowerCase());
 if(!['Certificate','Diploma','Advanced Diploma'].includes(c.level))throw fail('Choose a supported qualification level.');
 return {name,code,level:c.level,duration:text(c.duration,'Duration',80)};
 })};
 });
 if(!Array.isArray(input.announcements)||input.announcements.length>20)throw fail('Use up to twenty announcements.');
 const newsIds=new Set();
 result.announcements=input.announcements.map(a=>{const id=text(a.id,'Announcement ID',80);if(newsIds.has(id))throw fail('Announcement identifiers must be unique.');newsIds.add(id);if(a.date&&!/^\d{4}-\d{2}-\d{2}$/.test(a.date))throw fail('Use a valid announcement date.');return {id,title:text(a.title,'Announcement title',160),body:text(a.body,'Announcement text',1500),date:text(a.date||'','Date',10,true),to:route(a.to||'',true),label:text(a.label||'','Link text',80,true),visible:a.visible===true}});
 return result;
}
function install(app,{db,auth,admin,wrap}){
 const assets=path.join(__dirname,'uploads/site');fs.mkdirSync(assets,{recursive:true});
 const ready=(async()=>{
 await db.query('CREATE TABLE IF NOT EXISTS site_content(id INT PRIMARY KEY,draft JSON NOT NULL,published JSON NOT NULL,revision INT NOT NULL DEFAULT 1,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
 await db.query('CREATE TABLE IF NOT EXISTS site_content_history(id BIGINT AUTO_INCREMENT PRIMARY KEY,content JSON NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,editor_id INT NOT NULL)');
 await db.execute('INSERT IGNORE INTO site_content(id,draft,published,revision) VALUES(1,?,?,1)',[JSON.stringify(defaults),JSON.stringify(defaults)]);
 const [columns]=await db.query("SHOW COLUMNS FROM courses LIKE 'is_active'");
 if(!columns.length)try{await db.query('ALTER TABLE courses ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE')}catch(e){if(e.code!=='ER_DUP_FIELDNAME')throw e}
 })();ready.catch(()=>{});
 app.use('/api/site-assets',express.static(assets,{dotfiles:'deny',maxAge:'1y',immutable:true,fallthrough:false,setHeaders:res=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Security-Policy',"default-src 'none'")}}));
 app.get('/api/site-content',wrap(async(req,res)=>{await ready;const [rows]=await db.query('SELECT published,revision FROM site_content WHERE id=1');res.set('Cache-Control','no-store').json({success:true,content:parse(rows[0].published),revision:rows[0].revision})}));
 app.get('/api/admin/site-content',auth,admin,wrap(async(req,res)=>{await ready;const [rows]=await db.query('SELECT * FROM site_content WHERE id=1');const [history]=await db.query('SELECT id,created_at FROM site_content_history ORDER BY id DESC LIMIT 10');res.set('Cache-Control','no-store').json({success:true,draft:parse(rows[0].draft),published:parse(rows[0].published),revision:rows[0].revision,history})}));
 async function transaction(req,fn){await ready;const conn=await db.getConnection();try{await conn.beginTransaction();const [rows]=await conn.query('SELECT * FROM site_content WHERE id=1 FOR UPDATE');if(req.body.revision!==rows[0].revision)throw fail('Another update was saved. Reload the editor before saving again.',409);const result=await fn(conn,rows[0]);await conn.commit();return result}catch(e){await conn.rollback();throw e}finally{conn.release()}}
 app.put('/api/admin/site-content',auth,admin,wrap(async(req,res)=>{const draft=validate(req.body.draft);res.json(await transaction(req,async(conn,row)=>{await conn.execute('UPDATE site_content SET draft=?,revision=revision+1 WHERE id=1',[JSON.stringify(draft)]);return {success:true,draft,revision:row.revision+1}}))}));
 app.post('/api/admin/site-content/publish',auth,admin,wrap(async(req,res)=>res.json(await transaction(req,async(conn,row)=>{
 const content=validate(parse(row.draft));
 await conn.execute('INSERT INTO site_content_history(content,editor_id) VALUES(?,?)',[JSON.stringify(parse(row.published)),req.user.id]);
 await conn.query('UPDATE courses SET is_active=FALSE');
 for(const school of content.schools)for(const c of school.courses){
 const [conflicts]=await conn.execute('SELECT code FROM courses WHERE name=? AND code<>?',[c.name,c.code]);if(conflicts.length)throw fail('Programme name already belongs to another code: '+c.name,409);
 await conn.execute('INSERT INTO courses(code,name,school,level,duration,is_active) VALUES(?,?,?,?,?,TRUE) ON DUPLICATE KEY UPDATE name=VALUES(name),school=VALUES(school),level=VALUES(level),duration=VALUES(duration),is_active=TRUE',[c.code,c.name,school.id,c.level,c.duration]);
 }
 await conn.execute('UPDATE site_content SET published=?,revision=revision+1 WHERE id=1',[JSON.stringify(content)]);
 return {success:true,content,revision:row.revision+1};
 }))));
 app.post('/api/admin/site-content/restore',auth,admin,wrap(async(req,res)=>res.json(await transaction(req,async(conn,row)=>{const [history]=await conn.execute('SELECT content FROM site_content_history WHERE id=?',[Number(req.body.history_id)||0]);if(!history.length)throw fail('Version not found.',404);const draft=validate(parse(history[0].content));await conn.execute('UPDATE site_content SET draft=?,revision=revision+1 WHERE id=1',[JSON.stringify(draft)]);return {success:true,draft,revision:row.revision+1}}))));
 app.post('/api/admin/site-assets',auth,admin,wrap(async(req,res)=>{
 if(typeof req.body.data!=='string'||!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(req.body.data))throw fail('Upload a PNG, JPEG or WebP image.');
 const buffer=Buffer.from(req.body.data.split(',')[1],'base64');if(buffer.length>2*1024*1024)throw fail('Images must be 2 MB or smaller.');
 let ext;if(buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';else if(buffer[0]===255&&buffer[1]===216&&buffer[2]===255)ext='jpg';else if(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP')ext='webp';else throw fail('The selected file is not a supported image.');
 const name=crypto.randomBytes(18).toString('hex')+'.'+ext;await fs.promises.writeFile(path.join(assets,name),buffer,{flag:'wx'});res.status(201).json({success:true,url:'/api/site-assets/'+name});
 }));
 return {ready};
}
module.exports={install,validate,defaults};
