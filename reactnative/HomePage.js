/**
 * 首页
 * 展示订阅源的列表页
 */
import React from 'react'
import { Button, ScrollView, Text, View } from 'react-native'
import { Colors, Drawer } from 'react-native-ui-lib'
import Realm from 'realm'
import './Global'

/**
 * 所有订阅的未读，想看Item
 */
const AllSection = () => {
    return (
        <View style={{ borderRadius: 6, backgroundColor: 'white', marginTop: 12 }}>

        </View>
    )
}

/**
 * 订阅源列表
 */
const ChannelList = () => {
    renderList = () => {
        let list = []
        for (let item of global.channelLinks) {
            list.push(
                <View>
                    <Text>{item.title}</Text>
                    <Text>{item.url}</Text>
                </View>
            )
        }
        return list
    }

    return (
        <View>
            {renderList()}
        </View>
    )
}

const ActionBar = () => {
    return (
        <View style={{ width: '100%', height: 50, backgroundColor: 'red', position: 'absolute', bottom: 0 }}>

        </View>
    )
}

const HomePage = () => {
    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, paddingStart: 16, paddingEnd: 16, backgroundColor: 'green' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 24 }}>所有订阅</Text>
                {AllSection()}
                {ChannelList()}
            </ScrollView>
            {ActionBar()}
        </View>
    )
}

export default HomePage