from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

def _get_user_ip_address(request: Request) -> str:
    return get_remote_address(request)

global_rate_limiter = Limiter(
    key_func=_get_user_ip_address,
)