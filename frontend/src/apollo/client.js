
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const client = new ApolloClient({
    link: new HttpLink({
        uri: `${API_URL}/graphql`,
    }),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    productos: {
                        // Estrategia simple para mergear paginación si se usa fetchMore
                        merge(existing = [], incoming) {
                            return [...existing, ...incoming];
                        },
                    },
                },
            },
        },
    }),
});

export default client;
