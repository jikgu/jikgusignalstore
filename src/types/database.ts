export interface Product {
  id: number
  external_id: string | null
  mall_code: string | null
  name_ko: string
  name_original: string | null
  description_ko: string | null
  description_original: string | null
  category: string | null
  brand: string | null
  image_url: string | null
  additional_images: any | null
  currency: string | null
  price_original: number | null
  price_krw: number
  weight_kg: number | null
  dimensions: any | null
  stock_status: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  personal_customs_number: string | null
  created_at: string | null
  updated_at: string | null
}

export interface UserAddress {
  id: number
  user_id: string
  recipient: string
  phone: string
  postal_code: string
  address_line1: string
  address_line2: string | null
  is_default: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface Cart {
  id: number
  user_id: string
  created_at: string | null
  updated_at: string | null
}

export interface CartItem {
  id: number
  cart_id: number
  user_id: string
  product_id: number
  quantity: number
  price_krw: number
  created_at: string | null
  updated_at: string | null
  products?: Product
}

export interface Order {
  id: number
  order_number: string
  user_id: string
  status: string
  address_id: number | null
  shipping_address: any
  payment_method: string | null
  payment_status: string | null
  total_product_krw: number
  total_shipping_krw: number
  total_duty_krw: number
  total_fee_krw: number
  total_pay_krw: number
  paid_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  mall_code: string | null
  external_id: string | null
  name_snapshot: string
  price_snapshot: any | null
  quantity: number
  unit_price_krw: number
  subtotal_krw: number
  created_at: string | null
}

export interface Shipment {
  id: number
  order_id: number
  tracking_number: string | null
  carrier_code: string | null
  carrier_name: string | null
  status: string | null
  origin_country: string | null
  destination_country: string | null
  shipped_at: string | null
  delivered_at: string | null
  last_updated_at: string | null
  raw_tracking: any | null
  created_at: string | null
  updated_at: string | null
}