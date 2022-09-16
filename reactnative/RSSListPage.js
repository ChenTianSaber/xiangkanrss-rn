/**
 * 订阅源内容列表
 */
import React, { useState } from 'react'
import { Button, SectionList, Text, TouchableOpacity, View, Image } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import Ionicons from 'react-native-vector-icons/Ionicons'

const SectionItem = ({ item, navigation }) => {
    return (
        <TouchableOpacity activeOpacity={0.7} style={{ flex: 1, marginBottom: 12 }} onPress={() => {
            navigation.navigate('Content')
        }}>
            <View style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 12, paddingBottom: 12, flexDirection: 'row' }}>
                <Ionicons name='ellipse' size={10} color={Colors.blue40} style={{ paddingStart: 8, paddingEnd: 8, paddingTop: 4 }} />
                <View style={{ flex: 1, paddingEnd: 12 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', flex: 1 }}>这是标题这是标题这是标题这是标题这是标题这是标题</Text>
                    <Text style={{ fontSize: 15, marginTop: 6, color: Colors.grey20 }} numberOfLines={4}>这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述描述这是描述这是描述这是描述这是描述</Text>
                </View>
            </View>
            <View style={{ width: '100%', height: 0.5, backgroundColor: '#e4e4e4', marginStart: 26 }} />
        </TouchableOpacity>
    )
}

const SectionTitle = ({ section }) => {
    return (
        <View style={{ padding: 16, paddingStart: 8, backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: 'https://reactnative.dev/docs/assets/p_cat2.png' }} style={{ width: 18, height: 18, backgroundColor: Colors.grey10, borderRadius: 30 }} />
            <Text style={{ fontSize: 14, color: Colors.grey10, marginStart: 8 }}>订阅源名字</Text>
        </View>
    )
}

const RSSListPage = ({ navigation }) => {
    return (
        <View style={{ flex: 1, backgroundColor: Colors.white }}>
            <SectionList
                sections={[
                    { title: 'D', data: ['1', '2', '3'] },
                    { title: 'J', data: ['1', '2', '3', '4', '5', '6', '7'] },
                ]}
                renderItem={({ item }) => <SectionItem item={item} navigation={navigation} />}
                renderSectionHeader={({ section }) => <SectionTitle section={section} />}
                keyExtractor={(item, index) => index}
            />
        </View>
    )
}

export default RSSListPage