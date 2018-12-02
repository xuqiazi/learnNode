# 知识点回顾

## 正则

`/([\w\.]+)=([^;]+)(?:;|$)/g`

([\w\.]+) 一个或者多个（字母、数字、下划线或者.）
= =
([^;]+) 匹配一个或者多个非;的字符

(?:;|$) 不捕获要么匹配;要么结束

## 重定向

Further action needs to be taken in order to complete the request

301 Moved Permanently 

This and all future requests should be directed to the given URI.

302 Found (Previously "Moved temporarily") 比如登录态

## Http-only

An http-only cookie cannot be accessed by client-side APIs, such as JavaScript. This restriction eliminates the threat of cookie theft via cross-site scripting (XSS). However, the cookie remains vulnerable to cross-site tracing (XST) and cross-site request forgery (XSRF) attacks. A cookie is given this characteristic by adding the HttpOnly flag to the cookie.