/**
 * 想看，一个简洁好用的RSS阅读器
 */

import React from 'react'
import HomePage from './reactnative/page/HomePage'
import RSSListPage from './reactnative/page/RSSListPage'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ContentPage from './reactnative/page/ContentPage'
import EditChannelPage from './reactnative/page/EditChannelPage'
import AddChannelPage from './reactnative/page/AddChannelPage'
import SettingPage from './reactnative/page/SettingPage'

const Stack = createNativeStackNavigator()

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomePage} options={{ title: '订阅' }} />
        <Stack.Screen name='RSSList' component={RSSListPage} options={{ title: '内容列表' }} />
        <Stack.Screen name='AddChannel' component={AddChannelPage} options={{ title: '添加订阅' }} />
        <Stack.Screen name='EditChannel' component={EditChannelPage} options={{ title: '编辑订阅' }} />
        <Stack.Screen name='Content' component={ContentPage} options={{ title: '详情' }} />
        <Stack.Screen name='Setting' component={SettingPage} options={{ title: '设置' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
