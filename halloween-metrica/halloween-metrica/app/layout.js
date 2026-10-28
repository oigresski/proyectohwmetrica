import '@fontsource/griffy/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import './globals.css';

export const metadata = {
  title: 'Concurso de disfraces · Métrica',
  description: 'Vota por el mejor disfraz de Halloween de cada área.',
  icons: { icon: '/icon.svg' },
};

export const viewport = {
  themeColor: '#170a2e',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
