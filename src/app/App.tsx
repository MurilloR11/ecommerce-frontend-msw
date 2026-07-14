import { HomePage } from '@/pages/home'
import { DesignSystemPage } from '@/pages/design-system'

function App() {
  if (window.location.pathname === '/design-system') {
    return <DesignSystemPage />
  }

  return <HomePage />
}

export default App
