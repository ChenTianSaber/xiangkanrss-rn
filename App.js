/**
 * 想看，一个简洁好用的RSS阅读器
 */

import React from 'react'
import HomePage from './reactnative/HomePage'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomePage} options={{ title: '订阅' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
