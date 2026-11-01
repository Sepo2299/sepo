import React,{createContext,useContext,useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import defaults from './site-defaults';
const Context=createContext({content:defaults,schools:defaults.schools,refresh:()=>{}});
const base=(import.meta.env.VITE_API_BASE_URL||'/api').replace(/\/$/,'');
export function SiteProvider({children}){
 const [content,setContent]=useState(defaults),[preview]=useState(()=>new URLSearchParams(window.location.search).get('preview')==='1'),[error,setError]=useState('');
 async function refresh(){try{const token=sessionStorage.getItem('sepo-session');const r=await fetch(base+(preview?'/admin/site-content':'/site-content'),{cache:'no-store',headers:preview&&token?{Authorization:'Bearer '+token}:{}});if(!r.ok)throw Error(preview?'Sign in as an administrator to preview the draft.':'');const d=await r.json();if(d.content||d.draft){setContent(d.content||d.draft);setError('')}}catch(e){if(preview)setError(e.message)}}
 useEffect(()=>{refresh();const id=setInterval(refresh,30000);const visible=()=>{if(document.visibilityState==='visible')refresh()};document.addEventListener('visibilitychange',visible);return()=>{clearInterval(id);document.removeEventListener('visibilitychange',visible)}},[]);
 return <Context.Provider value={{content,schools:content.schools,refresh}}>{preview&&<div className="cms-preview-banner">{error||'Draft preview — these changes are not published.'}<Link to="/administration/content">Return to website manager →</Link><a href="/">Exit preview</a></div>}{children}</Context.Provider>
}
export function useSite(){return useContext(Context)}
export function Announcements(){const {content}=useSite();const news=content.announcements.filter(a=>a.visible);if(!news.length)return null;return <section className="section wrap announcements"><div className="section-heading"><div><span className="eyebrow">FROM SEPO COLLEGE</span><h2>News & announcements.</h2></div></div><div className="journey-grid">{news.map(a=><article className="journey-card" key={a.id}><span>{a.date}</span><h3>{a.title}</h3><p>{a.body}</p>{a.to&&<Link className="text-link" to={a.to}>{a.label||'Find out more'} →</Link>}</article>)}</div></section>}
