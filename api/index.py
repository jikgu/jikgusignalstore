import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Warning: Supabase env vars not set. Some features may not work properly.")
    supabase = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "jikgusignalstore"}


class CheckoutRequest(BaseModel):
    user_id: str
    address_id: int
    payment_method: str  


class CheckoutResponse(BaseModel):
    order_id: int
    order_number: str
    payment_status: str
    payment_redirect_url: Optional[str] = None


@app.post("/api/checkout", response_model=CheckoutResponse)
def checkout(body: CheckoutRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    user_result = (
        supabase.table("users")
        .select("*")
        .eq("id", body.user_id)
        .single()
        .execute()
    )
    
    if not user_result.data:
        raise HTTPException(status_code=400, detail="Invalid user")
    
    user = user_result.data

    address_result = (
        supabase.table("user_addresses")
        .select("*")
        .eq("id", body.address_id)
        .eq("user_id", body.user_id)
        .single()
        .execute()
    )
    
    if not address_result.data:
        raise HTTPException(status_code=400, detail="Invalid address")
    
    address = address_result.data

    cart_items_result = (
        supabase.table("cart_items")
        .select("*, products(*)")
        .eq("user_id", body.user_id)
        .execute()
    )
    
    cart_items = cart_items_result.data
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_product_krw = sum(
        item["price_krw"] * item["quantity"] for item in cart_items
    )
    shipping_krw = 10000  
    duty_krw = 0          
    fee_krw = 3000        
    total_pay_krw = total_product_krw + shipping_krw + duty_krw + fee_krw

    payment_status = "PAID"  

    order_res = (
        supabase.table("orders")
        .insert(
            {
                "user_id": body.user_id,
                "status": payment_status,
                "total_product_krw": total_product_krw,
                "total_shipping_krw": shipping_krw,
                "total_duty_krw": duty_krw,
                "total_fee_krw": fee_krw,
                "total_pay_krw": total_pay_krw,
            }
        )
        .execute()
    )
    order = order_res.data[0]
    order_id = order["id"]

    for item in cart_items:
        supabase.table("order_items").insert(
            {
                "order_id": order_id,
                "product_id": item["product_id"],
                "mall_code": item["products"]["mall_code"] if item.get("products") else None,
                "external_id": item["products"]["external_id"] if item.get("products") else None,
                "name_snapshot": item["products"]["name_ko"] if item.get("products") else "Unknown Product",
                "quantity": item["quantity"],
                "unit_price_krw": item["price_krw"],
                "subtotal_krw": item["price_krw"] * item["quantity"],
            }
        ).execute()

    supabase.table("cart_items").delete().eq("user_id", body.user_id).execute()

    return CheckoutResponse(
        order_id=order_id,
        order_number=str(order_id),
        payment_status=payment_status,
    )


@app.get("/api/admin/stats")
def get_admin_stats():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    orders_result = supabase.table("orders").select("*", count="exact").execute()
    users_result = supabase.table("users").select("*", count="exact").execute()
    products_result = supabase.table("products").select("*", count="exact").execute()
    
    return {
        "total_orders": orders_result.count if orders_result else 0,
        "total_users": users_result.count if users_result else 0,
        "total_products": products_result.count if products_result else 0,
    }


@app.post("/api/webhooks/payment")
def payment_webhook(data: dict):
    print(f"Payment webhook received: {data}")
    return {"status": "received"}