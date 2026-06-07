import React, { useEffect, useRef } from 'react';
import { Personail3DEngine } from '../engine/Personail3DEngine';

export const Canvas3D: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Personail3DEngine | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        engineRef.current = new Personail3DEngine(canvasRef.current);
        (window as any).NailEngine = engineRef.current;

        return () => {
            if (engineRef.current) {
                engineRef.current.dispose();
                engineRef.current = null;
                delete (window as any).NailEngine;
            }
        };
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block', outline: 'none', touchAction: 'none' }}
            />
        </div>
    );
};