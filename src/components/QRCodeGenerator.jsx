import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

/**
 * A reusable component to generate, display, and download a QR code using the 'qrcode.react' library.
 *
 * @param {{type: 'table' | 'invoice' | string, id: string}} props - The component props.
 * @returns {JSX.Element} The rendered QR code component.
 */
export default function QRCodeGenerator({ type, id }) {
    // State to hold the generated URL that the QR code will point to
    const [url, setUrl] = useState('');
    const qrCodeContainerRef = useRef(null);

    // Effect to construct the full URL whenever the type or id props change
    useEffect(() => {
        if (type && id) {
            const fullUrl = `${window.location.origin}/review/${type}/${id}`;
            setUrl(fullUrl);
        }
    }, [type, id]);

    /**
     * Handles downloading the generated QR code as a PNG image.
     * It finds the <canvas> element and converts its content to a data URL.
     */
    const handleDownload = () => {
        if (!qrCodeContainerRef.current || !url) {
            console.error("QR Code reference not found or URL is not set.");
            return;
        }

        // Find the canvas element rendered by the QRCodeCanvas component
        const canvas = qrCodeContainerRef.current.querySelector('canvas');
        if (!canvas) {
            console.error("Canvas element for QR Code not found.");
            return;
        }

        // Convert canvas to a PNG data URL
        const pngUrl = canvas.toDataURL("image/png");

        // Create a temporary link element to trigger the download
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qrcode-${type}-${id}.png`; // Dynamic filename
        
        // Append to body, click, and then remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center w-full max-w-xs text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-xl font-bold text-gray-800 mb-4 capitalize">Review QR Code</h3>
            
            {/* Container for the QR Code canvas */}
            <div ref={qrCodeContainerRef} className="mb-4 w-48 h-48 flex items-center justify-center bg-white rounded-lg border border-gray-200 p-2">
                {url ? (
                    <QRCodeCanvas
                        value={url}
                        size={176} // Size of the QR code canvas (176px fits nicely in a 192px box with padding)
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"M"} // Error correction level: L, M, Q, H
                        includeMargin={false}
                    />
                ) : (
                    <p className="text-sm text-gray-500 px-4">Generating QR Code...</p>
                )}
            </div>
            
            <p className="text-sm font-medium text-gray-600">Scan to view details</p>
            
            {/* Display the generated URL */}
   
            
            {/* Download Button */}
            <button
                onClick={handleDownload}
                disabled={!url}
                className="mt-4 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download QR
            </button>
        </div>
    );
}