import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text } from 'react-native';
import { palette } from './src/colors';
import { RootStackParamList, TabParamList } from './src/navigation';
import BookDetailScreen from './src/screens/BookDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import ShelfScreen from './src/screens/ShelfScreen';
import StatsScreen from './src/screens/StatsScreen';
import { BooksProvider } from './src/store';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.card,
    text: palette.text,
    primary: palette.accent,
  },
};

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.textMuted,
      }}
    >
      <Tab.Screen
        name="Shelf"
        component={ShelfScreen}
        options={{
          title: '本棚',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: '検索',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: '統計',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <BooksProvider>
      <NavigationContainer theme={theme}>
        <Stack.Navigator>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="BookDetail"
            component={BookDetailScreen}
            options={{ title: '本の記録', headerBackTitle: '戻る' }}
          />
        </Stack.Navigator>
        <StatusBar style="dark" />
      </NavigationContainer>
    </BooksProvider>
  );
}
