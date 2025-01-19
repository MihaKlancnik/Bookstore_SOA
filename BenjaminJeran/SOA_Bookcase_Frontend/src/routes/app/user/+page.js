import { error } from '@sveltejs/kit';

const headers = {
    'Content-Type': 'application/json',
};

async function logVisit(page) {
    try {
        const response = await fetch("http://localhost:5000/log-visit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page }),
        });

    } catch (error) {
        console.error("Error logging visit:", error);
    }
}


const fetchNotifications = async () => {
    try {
        const response = await fetch('https://notification-service-v1-0.onrender.com/api/notifications');

        if (!response.ok) {
            throw new Error('Failed to fetch notifications.');
        }

        const data = await response.json();
        notifications = data.notifications;
    } catch (err) {
        error = err.message;
    } finally {
        loading = false;
    }
};



export async function load() {
    let jwtToken = localStorage.getItem('jwt_token');

    if (jwtToken) {
        const decodedPayload = JSON.parse(atob(jwtToken.split('.')[1]));
        let role = decodedPayload.role;

        headers['authorization'] = `Bearer ${jwtToken}`;

        logVisit('user');

        if (role === "admin") {
            const response = await fetch('http://localhost:4001/api/users', { headers });

            if (!response.ok) {
                throw error(500, 'Failed to load user data');
            }

            const users = await response.json();
            console.log(users);


            const notificationsResponse = await fetch('https://notification-service-v1-0.onrender.com/api/notifications');
            console.log("notificationsResponse", notificationsResponse);

            let notifications;

            if (!notificationsResponse.ok) {
                notifications = 'Ni novih obvestil.';
            } else {
                notifications = await notificationsResponse.text();
            }

            const query = `
                query {
                getInventory {
                    id
                    items {
                    id
                    quantity
                    lastUpdated
                    }
                }
                }
            `;

            let inventory;

            try {
                const graphqlResponse = await fetch('http://localhost:4004/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query }),
                });

                if (!graphqlResponse.ok) {
                    inventory = [];
                }
                else {
                    const result = await graphqlResponse.json();
                    inventory = result.data.getInventory.items;
                }
            }
            catch (error) {
                console.error('Failed to fetch inventory data:', error);
                inventory = [];
            }

            return { users, notifications, inventory };
        }

        if (role === "user") {
            let userId = decodedPayload.sub;
            console.log("Prijavlen z uporabniškim računom: " + userId);

            // Fetching the user information
            const userResponse = await fetch(`http://localhost:4001/api/users/${userId}`, { headers });

            if (!userResponse.ok) {
                throw error(500, 'Failed to load user data');
            }

            const users = await userResponse.json();
            console.log("Tukaj je user");
            console.log(users);

            // Fetching the orders for the user
            const ordersResponse = await fetch(`http://localhost:2001/orders/user/${userId}`, { headers });

            if (!ordersResponse.ok) {
                throw error(500, 'Failed to load orders data');
            }

            const orders = await ordersResponse.json();
            console.log(orders)


            return { users, orders };
        }
        throw error(403, 'Forbidden');
    }

    throw error(401, 'Unauthorized');
}
