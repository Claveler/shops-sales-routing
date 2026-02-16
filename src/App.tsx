import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/layout';
import { SalesRoutingList, CreateRoutingWizard, EditRouting } from './components/sales-routing';
import { CatalogIntegrationPage, CreateIntegrationWizard } from './components/catalog-integration';
import { ChannelsPage } from './components/channels';
import { GuidePage } from './components/guide';
import { FeverPosPage } from './components/fever-pos';
import { DemoProvider } from './context/DemoContext';
import './styles/global.css';

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <Routes>
          {/* Fever POS — renders full-screen without the standard Layout */}
          <Route path="/box-office" element={<FeverPosPage />} />
          <Route path="/box-office/simulation" element={<FeverPosPage isSimulation />} />

          {/* All other routes use the standard Layout (header + sidebar) */}
          <Route element={<LayoutWrapper />}>
            {/* Redirect root to catalog integration */}
            <Route path="/" element={<Navigate to="/products/catalog-integration" replace />} />

            {/* Sales Routing Routes */}
            <Route path="/products/sales-routing" element={<SalesRoutingList />} />
            <Route path="/products/sales-routing/create" element={<CreateRoutingWizard />} />
            <Route path="/products/sales-routing/edit/:id" element={<EditRouting />} />

            {/* Catalog Integration Routes */}
            <Route path="/products/catalog-integration" element={<CatalogIntegrationPage />} />
            <Route path="/products/catalog-integration/create" element={<CreateIntegrationWizard />} />

            {/* Guide Route */}
            <Route path="/products/guide" element={<GuidePage />} />

            {/* Channels Routes */}
            <Route path="/products/channels" element={<ChannelsPage />} />

            {/* Catch all - redirect to catalog integration */}
            <Route path="*" element={<Navigate to="/products/catalog-integration" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DemoProvider>
  );
}

export default App;
