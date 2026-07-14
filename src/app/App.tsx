import { HomePage } from '@/pages/home'
import { DesignSystemPage } from '@/pages/design-system'
import { Layout } from '@/widgets/layout'

function App() {
  const page =
    window.location.pathname === '/design-system' ? <DesignSystemPage /> : <HomePage />

  return <Layout>{page}</Layout>
}

export default App
