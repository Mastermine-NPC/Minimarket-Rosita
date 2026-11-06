import { Component, Suspense, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, OrbitControls, useGLTF } from '@react-three/drei';
const path = '/images/video/archivos-glb/nivea_aftershave.glb';
function Model() { const { scene } = useGLTF(path); return <Bounds fit clip observe margin={1.3}><Center><primitive object={scene} /></Center></Bounds>; }
class ModelBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? <p role="alert">No fue posible cargar WebGL o el modelo. El resto del laboratorio sigue disponible.</p> : this.props.children; }
}
export default function ModelDemo() {
  const [loaded, setLoaded] = useState(false);
  return <><h1>Componentes 3D</h1><p>Visor independiente del recurso Nivea disponible. Carga bajo demanda; sin carrito, selección comercial ni rotación automática.</p><button onClick={() => setLoaded(v => !v)}>{loaded ? 'Descargar visor' : 'Cargar modelo 3D'}</button>{loaded && <ModelBoundary><div className="model-viewport" aria-label="Modelo 3D Nivea"><Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 1, 4] }}><ambientLight intensity={2} /><directionalLight position={[4, 6, 3]} intensity={3} /><Suspense fallback={null}><Model /></Suspense><OrbitControls enablePan={false} /></Canvas></div></ModelBoundary>}<p>Arrastra o usa dos dedos para explorar. La demostración no requiere interacción con este visor para completar tareas. Si no hay WebGL, se muestra un mensaje accesible.</p></>;
}
