# Usage
```js 
import DirectusHttpBasicMiddleware from 'directus-http-basic-middleware';
export default {
    id: 'import',
    handler:(router, context) => {
        const basic = (new DirectusHttpBasicMiddelware(context)).basic;
        router.use(basic);


        const { ItemsService } = context.services;
        router.post('/somerestrictedcollection', async (req, res) => {
            const service = new ItemsService('somerestrictedcollection', { accountability: req.accountability, schema: req.schema });
            const results = service.create(req.body);
            res.send(results);
        })
    }
```


	