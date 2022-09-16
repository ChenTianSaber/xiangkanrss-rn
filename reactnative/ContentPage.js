/**
 * 订阅源内容列表
 */
import React, { useState } from 'react'
import { Button, FlatList, Text, TouchableOpacity, View, Image } from 'react-native'
import WebView from 'react-native-webview'

const ContentPage = () => {
    return (
        <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
            <WebView
                style={{ flex: 1 }}
                source={{ uri: 'https://www.baidu.com' }}
            />
        </View>
    )
}

export default ContentPage