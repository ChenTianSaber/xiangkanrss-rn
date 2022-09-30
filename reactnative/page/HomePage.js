/**
 * 首页
 * 展示订阅源的列表页
 */
import React, { Component, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View, Image, RefreshControl, DeviceEventEmitter, Platform } from 'react-native'
import { Badge, Colors, ExpandableSection } from 'react-native-ui-lib'
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as rssParser from 'react-native-rss-parser'
import { insertRSSItem, queryChannels, queryRSSItemByReadState, updateChannelLastUpdated } from '../database/RealmManager'

var moment = require('moment')
var cheerio = require('cheerio')

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
                    navigation.navigate('RSSList', { readState: 0, title: '所有未读' })
                }} activeOpacity={0.8} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name='mail-unread' size={22} color={Colors.blue30} />
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
                    navigation.navigate('RSSList', { readState: 2, title: '所有想看' })
                }} activeOpacity={0.8} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name='ios-star' size={22} color={Colors.yellow30} />
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

    /**
     * 组装数据，将channel的数据转换成SectionList的数据
     */
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
                if (item.channelXmlLink == channel.xmlLink) {
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
                        navigation.navigate('RSSList', { channelXmlLink: data.xmlLink, title: data.title, readState: 0 })
                    }} onLongPress={() => {
                        navigation.navigate('EditChannel', { channel: data, items: [], isAdd: false })
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
                            <TouchableOpacity onPress={() => {
                                alert('查看该分类的内容')
                            }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.grey1 }}>{sectionName ? sectionName : '未分类'}</Text>
                            </TouchableOpacity>
                            <Ionicons name={isExpend ? 'ios-chevron-up' : 'ios-chevron-down'} size={20} color={Colors.grey1} />
                        </View>
                    }
                    onPress={() => setIsExpend(!isExpend)}
                >
                    <View style={{ flex: 1, borderWidth: 1, borderColor: "#e4e4e4", borderRadius: 8, marginTop: 12, backgroundColor: 'white' }}>
                        {viewList}
                    </View>
                </ExpandableSection >
            </View >
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
class ActionBar extends Component {

    state = { tipView: null }

    render() {
        return (
            <View style={{ width: '100%', height: 68, backgroundColor: '#f2f2f2', position: 'absolute', bottom: 0 }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 16, paddingEnd: 16 }} >
                    <Ionicons name={'cog-outline'} size={26} onPress={() => {
                        this.props.navigation.navigate('Setting')
                    }} />
                    <View>{this.state.tipView}</View>
                    <Ionicons name={'add-circle-outline'} size={26} onPress={() => {
                        this.props.navigation.navigate('AddChannel')
                    }} />
                </View>
                {Platform.OS == 'ios' ? <View style={{ width: 1, height: 20 }} /> : null}
            </View>
        )
    }
}

class HomePage extends Component {

    state = {
        channelList: [],
        allUnReadItemList: [],
        allWantReadItemList: [],
        refreshing: false
    }
    unReadItemList = []
    wantReadItemList = []
    allChannelList = []

    componentDidMount() {
        this.getChannelData()

        // 监听刷新
        DeviceEventEmitter.addListener('REFRESH', () => {
            this.getChannelData()
        })
    }

    /**
     * 查找数据库数据，更新UI
     */
    getChannelData = () => {
        this.allChannelList = queryChannels()
        this.wantReadItemList = queryRSSItemByReadState(2)
        this.unReadItemList = queryRSSItemByReadState(0)
        console.log('save data -> ', this.allChannelList.length, this.wantReadItemList.length, this.unReadItemList.length)

        this.setState({
            channelList: this.allChannelList,
            allUnReadItemList: this.unReadItemList,
            allWantReadItemList: this.wantReadItemList
        })

        if (this.allChannelList.length > 0) {
            try {
                this.updateTipView(
                    <Text>{`上次更新: ${moment(this.allChannelList[0].lastUpdated).format('YYYY-MM-DD h:mm')}`}</Text>
                )
            } catch (e) {
                console.log('updateTipView error')
            }
        }
    }

    /**
     * 更新底部的Tip
     */
    updateTipView = (view) => {
        this.tipView.setState({ tipView: view })
    }

    /**
     * 刷新订阅源的数据
     */
    refreshChannelData = async () => {
        for (channel of this.allChannelList) {
            // 变化TipView
            this.updateTipView(
                <Text>{`正在更新：[${this.allChannelList.indexOf(channel) + 1}/${this.allChannelList.length}]`}</Text>
            )
            try {
                let response = await fetch(channel.xmlLink)
                let responseData = await response.text()
                let rssData = await rssParser.parse(responseData)

                console.log('channel rssData请求完毕->', rssData.title, rssData.items.length)

                updateChannelLastUpdated(moment().format())

                for (let item of rssData.items) {
                    let content = item.content ? item.content : (item.description ? item.description : "")
                    let description = content.replace(/<[^>]+>/g, "").replace(/(^\s*)|(\s*$)/g, "").substring(0, 300)

                    // 获取第一张图当封面
                    let htmlParser = cheerio.load(content)
                    let cover = htmlParser('img').attr('src')
                    cover = cover ? cover : ''

                    try {
                        insertRSSItem({
                            title: item.title,
                            link: item.links[0].url,
                            description: description,
                            content: content,
                            author: item.authors[0] ? item.authors[0].name : '',
                            published: item.published ? item.published : moment().format(),
                            channelXmlLink: rssData.xmlLink,
                            channelTitle: rssData.title,
                            channelIcon: rssData.icon,
                            readState: 0,
                            cover: cover
                        })
                    } catch (e) {
                        console.log('该Item存储失败，估计是已存在', item.title, e)
                    }
                }
            } catch (e) {
                console.log('更新失败->', channel.title, e)
            }
            this.updateTipView(
                <Text>{`更新完毕: ${moment(this.allChannelList[0].lastUpdated).format('YYYY-MM-DD h:mm')}`}</Text>
            )
        }
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
                {this.state.channelList.length > 0 ?
                    <ScrollView style={{ flex: 1, paddingStart: 16, paddingEnd: 16 }} refreshControl={
                        <RefreshControl refreshing={false} onRefresh={() => {
                            if (this.state.refreshing) {
                                return
                            }
                            this.setState({ refreshing: true })
                            this.refreshChannelData()
                            this.setState({ refreshing: false })
                        }} />
                    }>
                        <AllSection navigation={this.props.navigation} unReadItemsSum={this.unReadItemList.length} wantReadItemsSum={this.wantReadItemList.length} />
                        <ChannelList navigation={this.props.navigation} channelList={this.state.channelList} unReadItemList={this.unReadItemList} />
                    </ScrollView> :
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 120 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: Colors.grey1 }}>这里很空</Text>
                        <Text style={{ fontSize: 14, color: Colors.grey1, marginTop: 4 }}>先点击右下角的按钮添加订阅源吧</Text>
                    </View>}
                <ActionBar ref={(view) => this.tipView = view} navigation={this.props.navigation} />
            </View >
        )
    }

}

export default HomePage