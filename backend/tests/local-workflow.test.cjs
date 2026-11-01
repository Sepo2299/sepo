const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
require('dotenv').config();
const {app,db}=require('../local-server');
test('local admissions, access control, approval, password change and registration persist correctly',async()=>{
 const cfg=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../../../../work/local-services/access.json'),'utf8'));
 const suffix=crypto.randomBytes(6).toString('hex'),email='local-test-'+suffix+'@example.test';
 let applicationId,studentId,userId,created=false;
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port+'/api';
 async function request(route,method='GET',body,token){const r=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()}}
 try{
 let r=await request('/health');assert.equal(r.status,200);assert.equal(r.data.database,'connected');
 r=await request('/admin/applications');assert.equal(r.status,401);
 r=await request('/applications','POST',{full_name:'Local Workflow Test',date_of_birth:'2000-01-01',email,phone:'0812345678',intended_course:'Software Development',planned_year:new Date().getFullYear()+1,study_mode:'full-time',highest_qualification:'Grade 12',institution:'Local Test School',year_completed:2024});
 assert.equal(r.status,201);created=true;const ref=r.data.application_number;assert.match(ref,/^APP/);
 r=await request('/applications/check/'+ref);assert.equal(r.status,400);
 r=await request('/applications/check/'+ref+'?email=other@example.test');assert.equal(r.status,404);
 r=await request('/applications/check/'+ref+'?email='+encodeURIComponent(email));assert.equal(r.data.application.status,'pending');assert.equal(r.data.application.full_name,undefined);
 r=await request('/auth/login','POST',{username:cfg.adminEmail,password:cfg.adminPassword});assert.equal(r.status,200);const admin=r.data.token;
 r=await request('/admin/applications','GET',null,admin);const application=r.data.applications.find(a=>a.email===email);assert.ok(application);applicationId=application.id;
 r=await request('/admin/applications/'+applicationId+'/status','PATCH',{status:'accepted'},admin);assert.equal(r.status,200);const creds=r.data.credentials;assert.ok(creds.temporary_password);studentId=r.data.student_id;
 r=await request('/admin/applications/'+applicationId+'/status','PATCH',{status:'accepted'},admin);assert.equal(r.status,200);assert.equal(r.data.credentials,null);assert.equal(r.data.student_id,studentId);
 r=await request('/auth/login','POST',{username:creds.student_number,password:creds.temporary_password});assert.equal(r.status,200);const token=r.data.token;userId=r.data.user.id;
 r=await request('/admin/students','GET',null,token);assert.equal(r.status,403);
 r=await request('/courses');const course=r.data.courses.find(c=>c.name==='Software Development');assert.ok(course);
 r=await request('/students/me/register','POST',{course_ids:[course.id]},token);assert.equal(r.status,403);
 r=await request('/auth/change-password','PUT',{current_password:creds.temporary_password,new_password:'Local-Test-Password-'+suffix},token);assert.equal(r.status,200);
 r=await request('/students/me/register','POST',{course_ids:[course.id,999999999]},token);assert.equal(r.status,400);
 r=await request('/students/me','GET',null,token);assert.equal(r.data.enrollments.length,0);
 r=await request('/students/me/register','POST',{course_ids:[course.id]},token);assert.equal(r.status,200);
 await request('/students/me/register','POST',{course_ids:[course.id]},token);
 r=await request('/students/me','GET',null,token);assert.equal(r.data.enrollments.length,1);assert.equal(r.data.student.student_number,creds.student_number);
 r=await request('/auth/login','POST',{username:email,password:creds.temporary_password});assert.equal(r.status,401);
 r=await request('/auth/login','POST',{username:email,password:'Local-Test-Password-'+suffix});assert.equal(r.status,200);
 }finally{
 try{if(created){
 await db.execute('DELETE e FROM enrollments e JOIN students s ON s.id=e.student_id JOIN users u ON u.id=s.user_id WHERE u.email=?',[email]);
 await db.execute('DELETE FROM applications WHERE email=?',[email]);
 await db.execute('DELETE s FROM students s JOIN users u ON u.id=s.user_id WHERE u.email=?',[email]);
 await db.execute('DELETE FROM users WHERE email=?',[email]);
 }}finally{await new Promise(r=>server.close(r));await db.end();}
 }
});
