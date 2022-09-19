/**
 * 首页
 * 展示订阅源的列表页
 */
import React, { Component, useEffect, useState } from 'react'
import { Button, ScrollView, Text, TouchableOpacity, View, Image } from 'react-native'
import { Badge, ColorName, Colors, Drawer, StackAggregator, ExpandableSection } from 'react-native-ui-lib'
import Realm from 'realm'
import './Global'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { ChannelScheme, RSSItemScheme } from './DataBase'

/**
 * 所有订阅的未读，想看
 */
const AllSection = ({ navigation }) => {
    return (
        <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#656668', paddingStart: 8 }}>所有订阅</Text>
            <View style={{ width: '100%', height: 113, borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, marginTop: 12, backgroundColor: 'white' }}>
                {/* 未读 */}
                <TouchableOpacity onPress={() => {
                    navigation.navigate('RSSList', { realm: realm })
                }} activeOpacity={0.8} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name='mail-unread-outline' size={22} color={'#262626'} />
                        <Text style={{ color: '#262626', fontSize: 16, marginStart: 16 }}>{'未读'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Badge label={'999'} size={16} backgroundColor={Colors.red30} />
                        <Ionicons name='chevron-forward' size={20} color={Colors.grey30} />
                    </View>
                </TouchableOpacity>
                <View style={{ width: '100%', height: 1, backgroundColor: '#e4e4e4' }} />
                {/* 想看 */}
                <TouchableOpacity onPress={() => {
                    navigation.navigate('RSSList')
                }} activeOpacity={0.8} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name='ios-star-outline' size={22} color={'#262626'} />
                        <Text style={{ color: '#262626', fontSize: 16, marginStart: 16 }}>{'想看'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Badge label={'999'} size={16} backgroundColor={Colors.blue30} />
                        <Ionicons name='chevron-forward' size={20} color={Colors.grey30} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

/**
 * 订阅源列表
 * 按照分类展示，可以点击伸缩展示
 * 展开的时候 - 展示每个分类的想看/未读
 * 收缩时 - 展示整个分类的想看/未读
 */
const ChannelList = (props) => {

    const { channelList } = props

    // 组装数据
    const map = new Map()
    map.set('', [])
    for (channel of channelList) {
        if (map.get(channel.fold) == null || map.get(channel.fold) == undefined) {
            map.set(channel.fold, [channel])
        } else {
            let list = map.get(channel.fold)
            list.push(channel)
            map.set(channel.fold, list)
        }
    }
    const dataList = []
    for (let [key, value] of map) {
        dataList.push({
            sectionName: key,
            list: value
        })
    }

    renderList = () => {
        let list = []
        for (let item of dataList) {
            list.push(
                <SectionItem item={item} navigation={props.navigation} key={item.sectionName} />
            )
        }
        return list
    }

    /**
     * 可伸缩展开的订阅源Item
     */
    const SectionItem = (props) => {
        const [isExpend, setIsExpend] = useState(true)
        let list = props.item.list
        let sectionName = props.item.sectionName
        let navigation = props.navigation
        let viewList = []

        for (let index = 0; index < list.length; index++) {
            let data = list[index]
            viewList.push(
                <View style={{ width: '100%' }} key={index}>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate('RSSList')
                    }} onLongPress={() => {
                        navigation.navigate('EditChannel')
                    }} activeOpacity={0.8} style={{ flex: 1, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={{ uri: data.cover }} style={{ width: 32, height: 32, backgroundColor: Colors.grey70, borderRadius: 30 }} />
                            <Text style={{ color: '#262626', fontSize: 16, marginStart: 16 }}>{data.title}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: Colors.grey20, marginEnd: 8 }}>98</Text>
                            <Ionicons name='chevron-forward' size={20} color={Colors.grey30} />
                        </View>
                    </TouchableOpacity>
                    {index == list.length - 1 ? null : <View style={{ width: '100%', height: 1, backgroundColor: '#e4e4e4' }} />}
                </View>

            )
        }

        return (
            <View style={{ marginTop: 16 }}>
                <ExpandableSection
                    top={false}
                    expanded={isExpend}
                    sectionHeader={
                        <View style={{ width: '100%', height: 36, paddingStart: 8, paddingEnd: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.grey1 }}>{sectionName ? sectionName : '未分类'}</Text>
                            <Ionicons name={isExpend ? 'ios-chevron-up' : 'ios-chevron-down'} size={20} color={Colors.grey1} />
                        </View>
                    }
                    onPress={() => setIsExpend(!isExpend)}
                >
                    <View style={{ flex: 1, borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, marginTop: 12, backgroundColor: 'white' }}>
                        {viewList}
                    </View>
                </ExpandableSection>
            </View>
        )
    }

    return (
        <View style={{ paddingBottom: 68 + 32 }}>
            {renderList()}
        </View>
    )
}

/**
 * 底部的操作区
 * 可以添加订阅/查看设置
 * 中间是操作tip, 用来做各种提示
 */
const ActionBar = ({ navigation }) => {
    return (
        <View style={{ width: '100%', height: 68, backgroundColor: '#f2f2f2', position: 'absolute', bottom: 0 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }} >
                <Ionicons name={'cog-outline'} size={26} onPress={() => {
                    navigation.navigate('Setting')
                }} />
                <Text style={{ fontSize: 12, color: Colors.grey20 }}>我是提示...</Text>
                <Ionicons name={'add-circle-outline'} size={26} onPress={() => {
                    navigation.navigate('AddChannel', { realm: realm })
                }} />
            </View>
            <View style={{ width: 1, height: 20 }} />
        </View>
    )
}

let realm = null

class HomePage extends Component {

    state = { channelList: [], allItemList: [] }

    componentDidMount() {
        getChannelData = async () => {
            // 获取本地数据库
            realm = await Realm.open({
                path: "xiangkan",
                schema: [ChannelScheme, RSSItemScheme],
            })
            const channels = realm.objects("Channel")
            const items = realm.objects("RSSItem")
            console.log('save data -> ', channels, items.length)
            this.setState({ channelList: channels, allItemList: items })
        }
        getChannelData()
    }

    componentWillUnmount() {
        realm && realm.close()
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
                <ScrollView style={{ flex: 1, paddingStart: 16, paddingEnd: 16 }}>
                    <AllSection navigation={this.props.navigation} realm={realm} />
                    <ChannelList navigation={this.props.navigation} channelList={this.state.channelList} />
                </ScrollView>
                <ActionBar navigation={this.props.navigation} />
            </View >
        )
    }

}

export default HomePage