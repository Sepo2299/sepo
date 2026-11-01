const crypto=require('crypto');
function encode(value,key,result){if(value!==null&&typeof value==='object'){for(const [k,v] of Object.entries(value))encode(v,key?key+'['+k+']':k,result)}else if(value!==undefined&&value!==null)result.append(key,String(value))}
async function call(fn,params,{timeoutMs=30000}={}){
 if(!process.env.MOODLE_URL||!process.env.MOODLE_TOKEN)throw Object.assign(Error('Moodle is not configured yet. Complete the local Moodle setup first.'),{status:503});
 const data=new URLSearchParams({wstoken:process.env.MOODLE_TOKEN,wsfunction:fn,moodlewsrestformat:'json'});encode(params,'',data);
 const url=process.env.MOODLE_URL.replace(/\/$/,'')+'/webservice/rest/server.php';
 let response;try{response=await fetch(url,{method:'POST',body:data,signal:AbortSignal.timeout(timeoutMs)})}catch{throw Object.assign(Error('Moodle did not respond in time or could not be reached. Check that the Moodle server is running.'),{status:503})}
 let result;try{result=await response.json()}catch{throw Object.assign(Error('Moodle returned an unexpected response. Check the local Moodle service.'),{status:502})}
 if(!response.ok||result?.exception)throw Object.assign(Error('Moodle could not complete this action'+(result?.errorcode?' ('+result.errorcode+')':'')+'.'),{status:502});
 return result;
}
async function syncStudent(db,id){
 const [rows]=await db.execute('SELECT s.*,u.full_name,u.email,u.username,u.moodle_id FROM students s JOIN users u ON u.id=s.user_id WHERE s.id=?',[id]);
 if(!rows.length)throw Object.assign(Error('Student not found.'),{status:404});const student=rows[0];let moodleId=student.moodle_id,credentials=null;
 if(!moodleId){
 const existing=await call('core_user_get_users_by_field',{field:'username',values:[student.username]});
 if(existing.length)moodleId=existing[0].id;
 else{
 const temporaryPassword=crypto.randomBytes(15).toString('base64url')+'Aa1!';
 const names=student.full_name.trim().split(/\s+/),firstname=names.shift(),lastname=names.join(' ')||firstname;
 const created=await call('core_user_create_users',{users:[{username:student.username,password:temporaryPassword,firstname,lastname,email:student.email,auth:'manual',preferences:[{type:'auth_forcepasswordchange',value:'1'}]}]});
 moodleId=created[0].id;credentials={student_number:student.student_number,email:student.email,temporary_password:temporaryPassword,platform:'Moodle'};
 }
 await db.execute('UPDATE users SET moodle_id=? WHERE id=?',[moodleId,student.user_id]);
 }
 const [courses]=await db.execute('SELECT c.*,e.id AS enrollment_id FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.student_id=?',[student.id]);
 let synced=0;
 for(const course of courses){
 let courseId=course.moodle_id;
 if(!courseId){
 const found=await call('core_course_get_courses_by_field',{field:'shortname',value:course.code});
 if(found.courses?.length)courseId=found.courses[0].id;
 else{const created=await call('core_course_create_courses',{courses:[{fullname:course.name,shortname:course.code,categoryid:1,summary:course.school+' · '+course.level+' · '+course.duration,summaryformat:1}]});courseId=created[0].id}
 await db.execute('UPDATE courses SET moodle_id=? WHERE id=?',[courseId,course.id]);
 }
 await call('enrol_manual_enrol_users',{enrolments:[{roleid:5,userid:moodleId,courseid:courseId}]});
 await db.execute('UPDATE enrollments SET moodle_synced=TRUE WHERE id=?',[course.enrollment_id]);synced++;
 }
 return {success:true,message:'Moodle account ready. '+synced+' course enrolment(s) synchronised.',credentials};
}
module.exports={call,syncStudent};
