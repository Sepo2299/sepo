import copy from './site-copy.json';
import schools from './schools.json';
const photos={science:'photo-1532094349884-543bc11b234d',computers:'photo-1516321318423-f06f85e504b3',automotive:'photo-1486262715619-67b85e0b08d3',entertainment:'photo-1485846234645-a62644f84728'};
export default {...copy,schools:schools.map(s=>({...s,image:'https://images.unsplash.com/'+photos[s.id]+'?auto=format&fit=crop&w=1200&q=80',courses:s.courses.map((c,i)=>({...c,code:s.id.toUpperCase().slice(0,3)+(i+101)}))}))};
