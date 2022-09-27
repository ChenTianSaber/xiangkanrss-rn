/**
 * 订阅源内容列表
 */
import React, { useState } from 'react'
import { Button, FlatList, Text, TouchableOpacity, View, Image } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import Ionicons from 'react-native-vector-icons/Ionicons'

const EditChannelPage = (props) => {

    const { channel, items } = props.route.params

    return (
        <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
            <View style={{ flex: 1, padding: 16 }}>
                <Image source={{ uri: channel.icon }} style={{ width: 30, height: 30 }} />
                <Text style={{ color: Colors.grey1, fontWeight: 'bold', fontSize: 18 }}>{channel.title}</Text>
                <Text style={{ color: Colors.grey20, fontSize: 14 }}>{channel.description}</Text>
                <Text style={{ color: Colors.grey30, fontSize: 12 }}>{channel.xmlLink}</Text>
                <Text style={{ color: Colors.grey30, fontSize: 12 }}>{items[0].authors[0] ? items[0].authors[0].name : ''}</Text>

                <TouchableOpacity activeOpacity={0.7} onPress={async () => {

                }} style={{ padding: 10, borderRadius: 8, backgroundColor: Colors.blue40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
                    <Ionicons name={'save-outline'} color={Colors.white} size={18} />
                    <Text style={{ fontSize: 16, color: Colors.white, fontWeight: 'bold', marginStart: 8 }}>保存</Text>
                    <View style={{ width: 18 }} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default EditChannelPage