/**
 * 首页
 * 展示订阅源的列表页
 */
import React, { Component, useEffect, useState } from 'react'
import { Button, ScrollView, Text, TouchableOpacity, View, Image, RefreshControl } from 'react-native'
import { Badge, ColorName, Colors, Drawer, StackAggregator, ExpandableSection } from 'react-native-ui-lib'
import Realm from 'realm'
import './Global'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { ChannelScheme, RSSItemScheme } from './DataBase'
import * as rssParser from 'react-native-rss-parser'

var moment = require('moment')
var Cheerio = require('cheerio')

/**
 * 所有订阅的未读，想看
 */
const AllSection = ({ navigation, unReadItemsSum, wantReadItemsSum }) => {
    return (
        <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#656668', paddingStart: 8 }}>所有订阅</Text>
            <View style={{ width: '100%', height: 113, borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, marginTop: 12, backgroundColor: 'white' }}>
                {/* 未读 */}
                <TouchableOpacity onPress={() => {
                    navigation.navigate('RSSList', { realm: realm, readState: 0 })
                }} activeOpacity={0.8} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name='mail-unread-outline' size={22} color={'#262626'} />
                        <Text style={{ color: '#262626', fontSize: 16, marginStart: 16 }}>{'未读'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {unReadItemsSum > 0 ? <Badge label={unReadItemsSum} size={16} backgroundColor={Colors.red30} /> : null}
                        <Ionicons name='chevron-forward' size={20} color={Colors.grey30} />
                    </View>
                </TouchableOpacity>
                <View style={{ width: '100%', height: 1, backgroundColor: '#e4e4e4' }} />
                {/* 想看 */}
                <TouchableOpacity onPress={() => {
                    navigation.navigate('RSSList', { realm: realm, readState: 2 })
                }} activeOpacity={0.8} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name='ios-star-outline' size={22} color={'#262626'} />
                        <Text style={{ color: '#262626', fontSize: 16, marginStart: 16 }}>{'想看'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {wantReadItemsSum > 0 ? <Badge label={wantReadItemsSum} size={16} backgroundColor={Colors.blue30} /> : null}
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
    const { unReadItemList } = props

    // 组装数据
    const map = new Map()
    map.set('', [])
    for (channel of channelList) {
        if (map.get(channel.fold) == null || map.get(channel.fold) == undefined) {
            let sum = 0
            for (item of unReadItemList) {
                if (item.channelTitle == channel.title) {
                    sum++
                }
            }
            map.set(channel.fold, [{ data: channel, unReadSum: sum }])
        } else {
            let sum = 0
            for (item of unReadItemList) {
                if (item.channelTitle == channel.title) {
                    sum++
                }
            }
            let list = map.get(channel.fold)
            list.push({ data: channel, unReadSum: sum })
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
            let data = list[index].data
            let unReadSum = list[index].unReadSum
            viewList.push(
                <View style={{ width: '100%' }} key={index}>
                    <TouchableOpacity onPress={() => {
                        // navigation.navigate('RSSList')
                    }} onLongPress={() => {
                        // navigation.navigate('EditChannel')
                    }} activeOpacity={0.8} style={{ flex: 1, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={{ uri: data.icon }} style={{ width: 32, height: 32, backgroundColor: Colors.grey80, borderRadius: 30 }} />
                            <Text style={{ color: '#262626', fontSize: 16, marginStart: 16 }}>{data.title}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: Colors.grey20, marginEnd: 8 }}>{unReadSum}</Text>
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
const ActionBar = ({ navigation, tip }) => {
    return (
        <View style={{ width: '100%', height: 68, backgroundColor: '#f2f2f2', position: 'absolute', bottom: 0 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }} >
                <Ionicons name={'cog-outline'} size={26} onPress={() => {
                    navigation.navigate('Setting')
                }} />
                <Text style={{ fontSize: 12, color: Colors.grey20 }}>{tip}</Text>
                <Ionicons name={'add-circle-outline'} size={26} onPress={() => {
                    navigation.navigate('AddChannel', { realm: realm })
                }} />
            </View>
            <View style={{ width: 1, height: 20 }} />
        </View>
    )
}

let realm = null
let unReadItemList = []
let wantReadItemList = []
let allChannelList = []

class HomePage extends Component {

    state = { channelList: [], allUnReadItemList: [], allWantReadItemList: [], refreshing: false, tip: '' }

    componentDidMount() {
        getChannelData = async () => {
            // 获取本地数据库
            realm = await Realm.open({
                path: "xiangkan",
                schema: [ChannelScheme, RSSItemScheme],
            })
            const channels = realm.objects("Channel")
            const wantReadItems = realm.objects("RSSItem").filtered("readState = '2'")
            const unReadItems = realm.objects("RSSItem").filtered("readState = '0'")

            allChannelList = channels
            unReadItemList = unReadItems
            wantReadItemList = wantReadItems

            console.log('save data -> ', channels.length, wantReadItems.length, wantReadItems.length)
            this.setState({ channelList: channels, allUnReadItemList: unReadItems, allWantReadItemList: wantReadItems, tip: `上次更新于: ${moment(channels[0].lastUpdated).format('YYYY-MM-DD h:mm')}` })
        }
        getChannelData()
    }

    componentWillUnmount() {
        realm && realm.close()
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
                <ScrollView style={{ flex: 1, paddingStart: 16, paddingEnd: 16 }} refreshControl={
                    <RefreshControl refreshing={this.state.refreshing} onRefresh={async () => {
                        this.setState({ refreshing: true })
                        // 刷新订阅源的数据
                        for (channel of allChannelList) {
                            this.setState({ tip: `正在更新:${channel.title}[${allChannelList.indexOf(channel) + 1}/${allChannelList.length}]` })
                            try {
                                let response = await fetch(channel.xmlLink)
                                let responseData = await response.text()
                                let rssData = await rssParser.parse(responseData)

                                console.log('channel rssData请求完毕->', rssData.title)

                                realm.write(() => {
                                    channel.lastUpdated = moment().format()
                                })

                                for (item of rssData.items) {

                                    let content = item.content ? item.content : (item.description ? item.description : "")
                                    let description = content.replace(/<[^>]+>/g, "").replace(/(^\s*)|(\s*$)/g, "").substring(0, 300)

                                    // 获取第一张图当封面
                                    let htmlParser = Cheerio.load(content)
                                    let cover = htmlParser('img').attr('src')
                                    cover = cover ? cover : ''

                                    console.log('cover ->', cover)

                                    try {
                                        realm.write(() => {
                                            let rssItem = realm.create("RSSItem", {
                                                title: item.title,
                                                link: item.links[0].url,
                                                description: description,
                                                content: content,
                                                author: item.authors[0].name,
                                                published: item.published,
                                                channelXmlLink: channel.xmlLink,
                                                channelTitle: rssData.title,
                                                channelIcon: channel.icon,
                                                readState: 0,
                                                readMode: 0,
                                                cover: cover
                                            })
                                        })
                                    } catch (e) {
                                        console.log('该Item存储失败，估计是已存在', item.title, e)
                                    }
                                }
                            } catch (e) {
                                console.log('更新失败->', channel.title, e)
                            }
                        }
                        this.setState({ refreshing: false })
                    }} />
                }>
                    <AllSection navigation={this.props.navigation} realm={realm} unReadItemsSum={unReadItemList.length} wantReadItemsSum={wantReadItemList.length} />
                    <ChannelList navigation={this.props.navigation} channelList={this.state.channelList} unReadItemList={unReadItemList} />
                </ScrollView>
                <ActionBar navigation={this.props.navigation} tip={this.state.tip} />
            </View >
        )
    }

}

export default HomePage