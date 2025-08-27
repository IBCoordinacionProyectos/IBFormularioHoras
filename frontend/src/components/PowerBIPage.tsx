import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { BarChart2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface PowerBIPageProps {
  onBack: () => void;
}

const PowerBIPage: React.FC<PowerBIPageProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // URL pública del informe de Power BI
  const powerBIEmbedUrl = 'https://app.powerbi.com/view?r=eyJrIjoiMTI4YzgwOTItOTU5Mi00MGMxLWI4YzYtZjllZDgzNDdmZGNlIiwidCI6IjY5NjA3NDJlLTljMGYtNGI0OC1hYTVlLWJhMTYxY2IwMGViNiJ9';
  
  // Configuración del iframe
  const iframeStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    visibility: isLoading ? 'hidden' as const : 'visible' as const
  };

  // Manejar la carga del iframe
  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('No se pudo cargar el informe de Power BI. Por favor, verifica tu conexión a Internet o inténtalo más tarde.');
  };

  // Limpiar el estado al desmontar
  useEffect(() => {
    return () => {
      setIsLoading(true);
      setError(null);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f2f6fd]">
      {/* Botón de volver flotante */}
      <div className="absolute top-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack} 
          className="flex items-center gap-1 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="text-sm">Volver</span>
        </Button>
      </div>

      {/* Contenedor principal del informe */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando informe de Power BI...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="h-full flex items-center justify-center p-4">
            <Card className="max-w-md border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="text-sm text-red-800">
                  {error} Si el problema persiste, por favor contacta al administrador.
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <iframe
            title="IB_InformeHoras"
            src={powerBIEmbedUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              visibility: isLoading ? 'hidden' : 'visible'
            }}
            allowFullScreen={true}
            allow="fullscreen"
            loading="eager"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>
    </div>
  );
};

export default PowerBIPage;
