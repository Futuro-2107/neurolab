import { useState } from 'react';
import { ArrowRight, BookOpen, BrainCircuit, GitBranch, Layers3, Zap } from 'lucide-react';
import { PageIntro, Panel } from '../../components/ui/Elements';

const concepts = [
  { name:'Neurona', icon:BrainCircuit, color:'violet', summary:'Unidad básica de procesamiento', body:'Recibe valores de entrada, los combina con pesos y un sesgo, y aplica una función de activación para producir una salida.', formula:'salida = activación(Σ entrada × peso + sesgo)' },
  { name:'Capas', icon:Layers3, color:'blue', summary:'Grupos de neuronas organizados', body:'La capa de entrada recibe los datos, las capas ocultas aprenden representaciones y la capa de salida produce la predicción.', formula:'Entrada → Ocultas → Salida' },
  { name:'Conexiones y pesos', icon:GitBranch, color:'green', summary:'Fuerza de las relaciones', body:'Cada conexión tiene un peso ajustable. Durante el entrenamiento, el modelo actualiza los pesos para reducir el error de predicción.', formula:'z = Σ(wᵢxᵢ) + b' },
  { name:'Activación', icon:Zap, color:'orange', summary:'Introduce no linealidad', body:'La función de activación transforma la suma ponderada y permite que la red aprenda relaciones complejas.', formula:'a = f(z)' }
];
const activations = {
  ReLU: { formula:'f(x) = max(0, x)', desc:'Convierte los valores negativos en cero y deja pasar los positivos. Es habitual en capas ocultas.' },
  Sigmoid: { formula:'f(x) = 1 / (1 + e⁻ˣ)', desc:'Comprime valores al rango entre 0 y 1. Puede utilizarse para una salida binaria.' },
  Tanh: { formula:'f(x) = tanh(x)', desc:'Devuelve valores entre −1 y 1 y centra la salida alrededor de cero.' },
  Softmax: { formula:'σ(zᵢ) = eᶻⁱ / Σ eᶻʲ', desc:'Transforma logits en una distribución de probabilidades para clasificación multiclase.' }
};
export default function Fundamentals() {
  const [selected,setSelected]=useState('ReLU');
  return <div className="page-stack"><PageIntro eyebrow="CENTRO DE APRENDIZAJE" title="Fundamentos neuronales" description="Explora los elementos que permiten a una red neuronal aprender patrones a partir de datos."/>
    <div className="fundamentals-hero"><div><span className="eyebrow">CONCEPTO CLAVE</span><h2>¿Qué es una red neuronal?</h2><p>Un modelo computacional inspirado de forma general en las conexiones neuronales. Aprende relaciones entre entradas y salidas ajustando parámetros a partir de ejemplos.</p><div className="hero-tags"><span><BrainCircuit size={14}/> Aprendizaje de patrones</span><span><GitBranch size={14}/> Capas conectadas</span></div></div><div className="neural-illustration"><svg viewBox="0 0 300 190" role="img" aria-label="Diagrama ilustrativo de una red neuronal">{[0,1,2,3].map((x)=>[0,1,2,3,4].map(y=><line key={`${x}-${y}`} x1={30+x*78} y1={25+y*34} x2={108+x*54} y2={42+((y+x)%5)*30} stroke="#6d8cff" strokeOpacity=".26"/>))}{[0,1,2,3].map((x)=>[0,1,2,3,4].map(y=><circle key={`${x}-${y}`} cx={24+x*82} cy={25+y*34} r="7" fill={x===1?'#8a7dff':'#5e83ff'} stroke="#b4c2ff" strokeWidth="1.2"/>))}</svg><span>Representación conceptual · DEMO</span></div></div>
    <div className="concept-grid">{concepts.map(({name,icon:Icon,color,summary,body,formula})=><article className="concept-card" key={name}><div className={`concept-icon ${color}`}><Icon size={20}/></div><h3>{name}</h3><span>{summary}</span><p>{body}</p><div className="formula">{formula}</div></article>)}</div>
    <Panel title="Funciones de activación" subtitle="Selecciona una función para consultar su comportamiento y uso habitual"><div className="activation-layout"><div className="activation-tabs">{Object.keys(activations).map(a=><button key={a} className={selected===a?'selected':''} onClick={()=>setSelected(a)}>{a}<ArrowRight size={15}/></button>)}</div><div className="activation-detail"><div><span className="eyebrow">FUNCIÓN SELECCIONADA</span><h2>{selected}</h2><p>{activations[selected as keyof typeof activations].desc}</p><div className="formula big-formula">{activations[selected as keyof typeof activations].formula}</div></div><div className="activation-graph"><ResponsiveActivation name={selected}/></div></div></div></Panel>
    <div className="info-callout"><BookOpen size={18}/><div><b>Ruta de aprendizaje recomendada</b><p>Comprende las neuronas y capas antes de construir tu primera arquitectura en el diseñador.</p></div><a href="/architectures">Ir al diseñador <ArrowRight size={15}/></a></div>
  </div>;
}
function ResponsiveActivation({name}:{name:string}) {
  const points=Array.from({length:25},(_,i)=>{const x=(i-12)/3;let y=0;if(name==='ReLU')y=Math.max(0,x);else if(name==='Sigmoid')y=1/(1+Math.exp(-x));else if(name==='Tanh')y=Math.tanh(x);else y=1/(1+Math.exp(-x));return {x:i,y:100-y*65};});
  const path=points.map((p,i)=>`${i?'L':'M'} ${p.x*8+5} ${p.y}`).join(' ');
  return <svg viewBox="0 0 210 115" role="img" aria-label={`Curva ilustrativa de ${name}`}><path d="M5 58 H205 M105 8 V105" stroke="#36425d" strokeDasharray="4 4" fill="none"/><path d={path} stroke="#8b7cff" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>;
}
