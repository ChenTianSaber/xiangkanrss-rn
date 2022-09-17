/**
 * 订阅源内容列表
 */
import React, { Component, useEffect, useState } from 'react'
import { Button, SectionList, Text, TouchableOpacity, View, Image } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import Ionicons from 'react-native-vector-icons/Ionicons'

const SectionItem = ({ item, navigation }) => {
    return (
        <TouchableOpacity activeOpacity={0.7} style={{ flex: 1, marginBottom: 12 }} onPress={() => {
            navigation.navigate('Content', { item: item })
        }}>
            <View style={{ flex: 1, backgroundColor: Colors.white, paddingTop: 12, paddingBottom: 12, flexDirection: 'row' }}>
                <Ionicons name='ellipse' size={10} color={Colors.blue40} style={{ paddingStart: 8, paddingEnd: 8, paddingTop: 4 }} />
                <View style={{ flex: 1, paddingEnd: 12 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', flex: 1, color: Colors.grey1 }}>{item.title}</Text>
                    <Text style={{ fontSize: 15, marginTop: 6, color: Colors.grey20 }} numberOfLines={4}>{item.description}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <Text style={{ fontSize: 12, color: Colors.grey30 }}>{item.author}</Text>
                        <Text style={{ fontSize: 12, color: Colors.grey30 }} numberOfLines={4}>{item.published}</Text>
                    </View>
                </View>
            </View>
            <View style={{ width: '100%', height: 0.5, backgroundColor: '#e4e4e4', marginStart: 26 }} />
        </TouchableOpacity>
    )
}

const SectionTitle = ({ section }) => {
    return (
        <View style={{ padding: 16, paddingStart: 8, backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: section.icon }} style={{ width: 18, height: 18, backgroundColor: Colors.grey10, borderRadius: 30 }} />
            <Text style={{ fontSize: 14, color: Colors.grey10, marginStart: 8 }}>{section.title}</Text>
        </View>
    )
}

class RSSListPage extends Component {

    state = { sectionList: [] }

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { realm } = this.props.route.params
        let list = realm.objects("RSSItem")
        console.log(list.length)

        // 组装sectionList
        let dataList = []

        for (let i = 0; i < list.length; i++) {
            let item = list[i]
            if (i == 0) {
                dataList.push(
                    {
                        title: item.channelTitle,
                        icon: item.channelIcon,
                        data: [item]
                    }
                )
            } else {
                if (item.channelTitle == list[i - 1].channelTitle) {
                    dataList[dataList.length - 1].data.push(item)
                } else {
                    dataList.push(
                        {
                            title: item.channelTitle,
                            icon: item.channelIcon,
                            data: [item]
                        }
                    )
                }
            }
        }

        this.setState({ sectionList: dataList })
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.white }}>
                <SectionList
                    sections={this.state.sectionList}
                    renderItem={({ item }) => <SectionItem item={item} navigation={this.props.navigation} />}
                    renderSectionHeader={({ section }) => <SectionTitle section={section} />}
                    keyExtractor={(item, index) => index}
                />
            </View>
        )
    }
}

export default RSSListPage