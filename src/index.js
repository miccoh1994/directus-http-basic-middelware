function DirectusHttpBasicMiddleware({
    services,
    exceptions,
    database,
    getSchema,
}) {
    const { AuthenticationService } = services;
    const { InvalidCredentialsException, ForbiddenException } = exceptions;
    const { getSchema, database } = context;
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers;
            if (!authorization) {
                next();
                return;
            }
            const [type, encoded] = authorization.split(" ");
            if (type !== "Basic") {
                next();
                return;
            }
            const creds = Buffer.from(encoded, "base64").toString("utf-8");
            const [email, password] = creds.split(":");

            const accountability = {
                ip: req.ip,
                userAgent: req.get("user-agent"),
                role: null,
            };

            const auth = new AuthenticationService({
                accountability: accountability,
                schema: req.schema,
            });

            const { id } = await auth.login(undefined, { email, password });

            const user = await database
                .select(
                    "role",
                    "directus_roles.admin_access",
                    "directus_roles.app_access"
                )
                .from("directus_users")
                .leftJoin(
                    "directus_roles",
                    "directus_users.role",
                    "directus_roles.id"
                )
                .where({
                    "directus_users.id": id,
                    status: "active",
                })
                .first();
            if (!user) {
                throw new InvalidCredentialsException();
            }

            req.accountability.user = id;
            req.accountability.role = user.role;
            req.accountability.admin =
                user.admin_access === true || user.admin_access == 1;
            req.accountability.app =
                user.app_access === true || user.app_access == 1;

            const schema = await getSchema({
                accountability: req.accountability,
                database,
            });

            req.schema = schema;

            next();
        } catch (err) {
            console.log(err);
            next(new ForbiddenException("Could not authenticate user"));
        }
    };
}

export default DirectusHttpBasicMiddleware;
