"use client";
import { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import Link from 'next/link';


export default function Pago() {
    const [metodoSeleccionado, setMetodoSeleccionado] = useState('');
    const [pagoConfirmado, setPagoConfirmado] = useState(false);

    useEffect(() => {
        localStorage.setItem('metodoSeleccionado', metodoSeleccionado);
    }, [metodoSeleccionado]);

    const seleccionMetodoPago = (metodo) => {
        setMetodoSeleccionado(metodo);
        setPagoConfirmado(false);
    };

    const manejarConfirmacionPagoSinpe = () => {
        setPagoConfirmado(true);
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: 'lightBlue' }}>
            <div className="card p-4" style={{ width: '50%' }}>
                <div className="card-body">
                    <div className="text-center mb-4">
                        <h1 className="h3">Seleccione el método de Pago</h1>
                    </div>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-primary me-3 btn-lg" onClick={() => seleccionMetodoPago('Efectivo')}>Efectivo</button>
                        <button className="btn btn-primary btn-lg" onClick={() => seleccionMetodoPago('Sinpe')}>Sinpe</button>
                    </div>
                    {metodoSeleccionado === 'Efectivo' && (
                        <div>
                            <p>Número de compra: 00000.</p>
                            <p>Por favor espere, hasta que el administrador confirme su pago...</p>
                        </div>
                    )}
                    {metodoSeleccionado === 'Sinpe' && (
                        <div>
                            <p>Número de compra: 00000.</p>
                            <p>Realice el pago por medio de SinpeMovil al número 8655-8255.</p>
                            <input type="text" className="form-control mb-3" placeholder="Ingrese el código de recibo aquí" />
                            <button className="btn btn-primary me-3 btn-lg" onClick={manejarConfirmacionPagoSinpe}>Confirmar compra</button>
                            {pagoConfirmado && <p>Por favor espere, hasta que el administrador confirme su pago...</p>}
                        </div>
                    )}
                </div>
            </div>
            <Link href="/">
                <button className="btn btn-light" style={{ backgroundColor: 'pink', color: 'black', marginRight: '10px' }}>Inicio</button>
            </Link>
        </div>
    );
}