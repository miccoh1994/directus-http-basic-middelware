# Motivation

You may run into a case that you need to recieve requests to directus from a legacy system that only supports Http Basic. (looking at you certain crm and hospitality companies)

# Usage
```js 
import DirectusHttpBasicMiddleware from 'directus-http-basic-middleware';
export default {
    id: 'basic', // full route for post becomes /basic/items/:collection
    handler:(router, context) => {
        const basic = DirectusHttpBasicMiddelware(context);
        router.use(basic);


        const { ItemsService } = context.services;
        router.post('/items/:collection', async (req, res) => {
            const service = new ItemsService(req.params.collection, {
                accountability: req.accountability,
                schema: req.schema
            })
            const results = Array.isArray(req.body) ? service.createMany(req.body) : service.createOne(req.body);
            res.send(results);
        })
    }
```