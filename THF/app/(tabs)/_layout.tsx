import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#E8304A' }}>
            <Tabs.Screen
                name="Dashboard"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="MyBookings"
                options={{
                    title: 'Bookings',
                    tabBarIcon: ({ color }) => <FontAwesome name="calendar" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="Earnings"
                options={{
                    title: 'Earnings',
                    tabBarIcon: ({ color }) => <FontAwesome name="money" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="Profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
