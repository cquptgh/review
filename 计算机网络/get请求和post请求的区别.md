1. 对于get请求点击刷新或者回退按钮是无害的，post请求会重新发起请求提交数据；
2. get请求的url地址可以被收藏，post请求不行；
3. get请求的参数是放在url中的，所以安全性较差，不适合用来携带敏感信息，并且参数的长度也会受到限制，post请求的参数是放在请求体中的，所以安全性相对来说更好，参数的长度理论上没有限制；
4. get请求会被浏览器主动缓存，post请求不会，除非手动设置；
5. get请求的参数会保存到浏览器的历史记录中，post请求不行；
6. get请求只能进行url编码，post请求可以使用多种编码方式；
7. get请求只能接收ASCII字符的参数，post请求没有要求；
8. get请求只会残生一个http数据包，post请求会产生两个。