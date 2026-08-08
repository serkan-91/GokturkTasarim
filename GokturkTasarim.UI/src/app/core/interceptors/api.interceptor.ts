import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({
    setHeaders: {
      'Accept': 'application/json',
      'X-Client-Platform': 'GokturkTasarim-AngularUI'
    }
  });
  return next(apiReq);
};
