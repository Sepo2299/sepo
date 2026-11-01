const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../../../..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'work/local-services/access.json'),'utf8'));
fs.writeFileSync(path.join(root,'outputs/Sepo-College-Local-Access.txt'),[
 'SEPO COLLEGE — PRIVATE LOCAL ACCESS',
 'Keep this file private. Do not upload it to GitHub or send it with the project.',
 '',
 'Website: http://localhost:5181',
 'Administration: http://localhost:5181/administration',
 'Administrator email: '+cfg.adminEmail,
 'Administrator password: '+cfg.adminPassword,
 '',
 'Moodle: http://localhost:8088',
 'Moodle administrator username: '+cfg.moodleAdmin,
 'Moodle administrator password: '+cfg.moodleAdminPassword,
 '',
 'These are for this PC only. Moodle access works after installation completes.',
 'Application approval creates student college credentials in the administrator workspace.',
 'Students must change the temporary college password before registering for courses.',
 'The Create Moodle account action creates separate Moodle credentials and enrols registered courses.',
 'Share credentials only with the intended student.'
].join('\n'),'utf8');
console.log('Private access details saved in outputs/Sepo-College-Local-Access.txt. No credentials printed.');
