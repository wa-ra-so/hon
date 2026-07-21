import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { palette, serifFont } from './src/colors';
import { RootStackParamList, TabParamList } from './src/navigation';
import BookDetailScreen from './src/screens/BookDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import ShelfScreen from './src/screens/ShelfScreen';
import StatsScreen from './src/screens/StatsScreen';
import { BooksProvider } from './src/store';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.background,
    card: palette.backgroundDeep,
    text: palette.text,
    border: palette.cardBorder,
    primary: palette.accent,
  },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.textFaint,
        tabBarStyle: {
          backgroundColor: palette.backgroundDeep,
          borderTopColor: palette.cardBorder,
        },
        tabBarIcon: () => null,
        tabBarIconStyle: { display: 'none' },
        tabBarItemStyle: { justifyContent: 'center' },
        tabBarLabelStyle: { fontSize: 12, letterSpacing: 3 },
      }}
    >
      <Tab.Screen name="Shelf" component={ShelfScreen} options={{ title: '本棚' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'さがす' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: '記録' }} />
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
            options={{
              title: '本の記録',
              headerBackTitle: '戻る',
              headerStyle: { backgroundColor: palette.backgroundDeep },
              headerTitleStyle: { fontFamily: serifFont, fontSize: 16 },
              headerTintColor: palette.text,
            }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </BooksProvider>
  );
}
