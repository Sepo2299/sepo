const fs=require('fs'),path=require('path'),crypto=require('crypto'),mysql=require('mysql2/promise'),bcrypt=require('bcryptjs');
const root=path.resolve(__dirname,'../../../..');
const runtime=path.join(root,'work/local-services');
const secret=()=>crypto.randomBytes(24).toString('base64url');
async function main(){
 fs.mkdirSync(runtime,{recursive:true});
 const configPath=path.join(runtime,'access.json');
 let cfg;
 if(fs.existsSync(configPath))cfg=JSON.parse(fs.readFileSync(configPath,'utf8'));
 else{cfg={dbRoot:secret(),dbPassword:secret(),moodlePassword:secret(),adminPassword:secret(),jwtSecret:secret(),moodleAdminPassword:secret()+'Aa1!',adminEmail:'admin@sepocollege.local',moodleAdmin:'collegeadmin'};fs.writeFileSync(configPath,JSON.stringify(cfg,null,2))}
 const sql=[
 "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '"+cfg.dbRoot+"';",
 "CREATE DATABASE IF NOT EXISTS sepo_college_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
 "CREATE DATABASE IF NOT EXISTS sepo_moodle_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
 "CREATE USER IF NOT EXISTS 'sepo_app'@'localhost' IDENTIFIED WITH mysql_native_password BY '"+cfg.dbPassword+"';",
 "GRANT ALL ON sepo_college_local.* TO 'sepo_app'@'localhost';",
 "CREATE USER IF NOT EXISTS 'sepo_moodle'@'localhost' IDENTIFIED WITH mysql_native_password BY '"+cfg.moodlePassword+"';",
 "GRANT ALL ON sepo_moodle_local.* TO 'sepo_moodle'@'localhost';"
 ].join('\n');
 fs.writeFileSync(path.join(runtime,'mysql-bootstrap.sql'),sql);
 fs.writeFileSync(path.join(__dirname,'.env'),[
 'PORT=5000','HOST=127.0.0.1','NODE_ENV=development','DB_HOST=127.0.0.1','DB_PORT=3307',
 'DB_NAME=sepo_college_local','DB_USER=sepo_app','DB_PASSWORD='+cfg.dbPassword,'JWT_SECRET='+cfg.jwtSecret,
 'MOODLE_URL=http://localhost:8088','MOODLE_TOKEN=','FRONTEND_URL=http://localhost:5181'
 ].join('\n')+'\n');
 if(process.argv.includes('--prepare')){console.log('Local configuration prepared. Secrets were not printed.');return}
 const db=await mysql.createConnection({host:'127.0.0.1',port:3307,user:'sepo_app',password:cfg.dbPassword,database:'sepo_college_local',multipleStatements:true});
 await db.query(fs.readFileSync(path.join(__dirname,'local-schema.sql'),'utf8'));
 const [admins]=await db.execute('SELECT id FROM users WHERE email=?',[cfg.adminEmail]);
 if(!admins.length)await db.execute('INSERT INTO users(email,username,password,full_name,role,must_change_password) VALUES(?,?,?,?,?,FALSE)',[cfg.adminEmail,'collegeadmin',await bcrypt.hash(cfg.adminPassword,12),'College Administrator','admin']);
 const schools=JSON.parse(fs.readFileSync(path.join(__dirname,'../frontend/src/schools.json'),'utf8'));
 for(const school of schools)for(const [i,c] of school.courses.entries())await db.execute('INSERT IGNORE INTO courses(code,name,school,level,duration) VALUES(?,?,?,?,?)',[school.id.toUpperCase().slice(0,3)+(i+101),c.name,school.id,c.level,c.duration]);
 await db.end();
 fs.writeFileSync(path.join(__dirname,'../frontend/.env.local'),'VITE_MOODLE_URL=http://localhost:8088\nVITE_API_BASE_URL=/api\n');
 console.log('College schema, administrator, and programme catalogue are ready.');
}
main().catch(e=>{console.error(e.code||e.message);process.exitCode=1});
