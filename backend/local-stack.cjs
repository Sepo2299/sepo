const fs=require('fs'),path=require('path'),cp=require('child_process'),net=require('net');
const root=path.resolve(__dirname,'../../../..'),runtime=path.join(root,'work/local-services'),mysql='C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqld.exe',php='C:/xampp/php/php.exe';
const children=[];
function start(binary,args,cwd=__dirname){const p=cp.spawn(binary,args,{cwd,stdio:'inherit',windowsHide:true});children.push(p);p.on('error',e=>console.error('Could not start '+path.basename(binary)+': '+e.message));return p}
function run(binary,args,cwd=__dirname){return new Promise((resolve,reject)=>{const p=start(binary,args,cwd);p.on('exit',code=>code===0?resolve():reject(Error(path.basename(binary)+' exited with code '+code)))})}
function listening(port){return new Promise(resolve=>{const socket=net.createConnection({host:'127.0.0.1',port});socket.setTimeout(1000);socket.on('connect',()=>{socket.destroy();resolve(true)});socket.on('error',()=>resolve(false));socket.on('timeout',()=>{socket.destroy();resolve(false)})})}
async function wait(port,limit=120){for(let i=0;i<limit;i++){if(await listening(port))return;if(i>0&&i%30===0)console.log('Still waiting for service on port '+port+' to finish starting…');await new Promise(r=>setTimeout(r,1000))}throw Error('Service did not start on port '+port+'.')}
async function main(){
 if(!fs.existsSync(path.join(runtime,'access.json')))throw Error('Local configuration is missing. Run backend/setup-local.cjs --prepare first.');
 if(!fs.existsSync(path.join(runtime,'mysql-data/mysql')))throw Error('The project database is not initialised yet.');
 if(!await listening(3307)){console.log('Starting the college database. Recovery can take several minutes; keep this window open.');start(mysql,['--no-defaults','--basedir=C:/Program Files/MySQL/MySQL Server 8.0','--datadir='+path.join(runtime,'mysql-data'),'--port=3307','--bind-address=127.0.0.1','--mysqlx=0','--console']);await wait(3307,600)}
 await run(process.execPath,['setup-local.cjs']);
 await run(process.execPath,['--test','tests/local-workflow.test.cjs']);
 if(!fs.existsSync(path.join(runtime,'moodle.ready'))){
 console.log('Extracting the official Moodle download. Keep this window open.');
 const sevenzip='C:/Program Files/7-Zip/7z.exe',unpack=path.join(runtime,'moodle-unpack'),tar=path.join(unpack,'moodle.tar');
 if(!fs.existsSync(tar))await run(sevenzip,['x',path.join(runtime,'moodle.tgz'),'-o'+unpack,'-y','-bsp0']);
 await run(sevenzip,['x',tar,'-o'+runtime,'-aoa','-y','-bsp0']);
 if(!fs.existsSync(path.join(runtime,'moodle/admin/cli/install.php')))throw Error('The Moodle download did not contain the installer.');
 fs.writeFileSync(path.join(runtime,'moodle.ready'),'Extracted successfully.\n');
 }
 const ini=path.join(runtime,'php-config/php.ini'),moodle=path.join(runtime,'moodle');
 if(!fs.existsSync(path.join(moodle,'config.php')))await run(php,['-c',ini,path.join(runtime,'install-moodle.php')]);
 await run(php,['-c',ini,path.join(runtime,'configure-moodle.php')]);
 if(!await listening(8088)){start(php,['-c',ini,'-S','127.0.0.1:8088','-t',moodle]);await wait(8088)}
 require('dotenv').config({override:true});
 console.log('Checking Moodle integration. The first request can take a few minutes; keep this window open.');
 const moodleUsers=await require('./moodle-service.cjs').call('core_user_get_users_by_field',{field:'username',values:['collegeadmin']},{timeoutMs:180000});
 if(!moodleUsers.length)throw Error('Moodle integration check could not find the local administrator.');
 console.log('Moodle integration check passed.');
 if(!await listening(5000)){start(process.execPath,['local-server.js']);await wait(5000)}
 const health=await fetch('http://127.0.0.1:5000/api/health',{signal:AbortSignal.timeout(10000)}).then(r=>r.json());
 if(health.service!=='sepo-college-local')throw Error('Port 5000 is used by another backend. Stop that backend, then run this launcher again.');
 if(!await listening(5181)){
 const vite=path.join(__dirname,'../frontend/node_modules/vite/bin/vite.js');
 start(process.execPath,[vite,'--host','127.0.0.1','--port','5181','--strictPort'],path.join(__dirname,'../frontend'));await wait(5181);
 }else console.log('If the website was already running, restart its terminal once to load the new Moodle settings.');
 console.log('\nCollege website: http://localhost:5181\nStudent/admin portal: http://localhost:5181/student-portal\nMoodle: http://localhost:8088\nKeep this window open. Press Ctrl+C to stop services started here.');
 let cronRunning=false;
 const runCron=()=>{
 if(cronRunning||!fs.existsSync(path.join(moodle,'config.php')))return;
 cronRunning=true;
 const log=fs.openSync(path.join(runtime,'moodle-cron.log'),'a');
 const task=cp.spawn(php,['-c',ini,path.join(moodle,'admin/cli/cron.php'),'--keep-alive=0'],{cwd:__dirname,stdio:['ignore',log,log],windowsHide:true});
 fs.closeSync(log);children.push(task);
 task.once('error',()=>{cronRunning=false;console.error('Moodle scheduled tasks could not start.');});
 task.once('close',code=>{cronRunning=false;const i=children.indexOf(task);if(i!==-1)children.splice(i,1);if(code!==0)console.error('Moodle scheduled tasks reported an error. See work/local-services/moodle-cron.log.');});
 };
 runCron();setInterval(runCron,60000).unref();
}
process.on('SIGINT',()=>{for(const child of children)if(child.exitCode===null)child.kill();process.exit(0)});
main().catch(e=>{console.error(e.message);process.exitCode=1});
