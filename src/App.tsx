import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from './routes/Home'
import Category from './routes/Category'
import Search from './routes/Search'
import Product from './routes/Product'
import Cart from './routes/Cart'
import Checkout from './routes/Checkout'
import Orders from './routes/Orders'
import OrderDetail from './routes/OrderDetail'
import MyPage from './routes/MyPage'
import Help from './routes/Help'
import Layout from './components/Layout'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="category/:slug" element={<Category />} />
            <Route path="search" element={<Search />} />
            <Route path="product/:productId" element={<Product />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="mypage" element={<MyPage />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App