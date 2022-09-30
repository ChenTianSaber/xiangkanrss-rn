/**
 * 订阅源内容列表
 */
import React, { Component, useState } from 'react'
import { Button, FlatList, Text, TouchableOpacity, View, Image } from 'react-native'
import { Colors, Dialog, PanningProvider } from 'react-native-ui-lib'

class FoldManagerPage extends Component {

    state = { createFold: false }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
                <Dialog
                    visible={this.state.createFold}
                    onDismiss={() => this.setState({ createFold: false })}
                    panDirection={PanningProvider.Directions.DOWN}
                >
                    {<View style={{ width: '100%', height: 100, backgroundColor: Colors.white, borderRadius: 8, alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 16 }}>
                        <Button label={'新建'} size={Button.sizes.medium} backgroundColor={Colors.red30} onPress={() => {

                        }} />
                    </View>}
                </Dialog>
                {/* 添加按钮 */}
                <Button title="新建分类" onPress={() => {
                    this.setState({ createFold: true })
                }} />

                {/* 分类列表 */}
                <FlatList
                    style={{ flex: 1 }}
                    data={[
                        { key: 'Devin' },
                        { key: 'Dan' },
                        { key: 'Dominic' },
                        { key: 'Jackson' },
                        { key: 'James' },
                        { key: 'Joel' },
                        { key: 'John' },
                        { key: 'Jillian' },
                        { key: 'Jimmy' },
                        { key: 'Julie' },
                    ]}
                    renderItem={({ item }) =>
                        <View style={{ width: '100%', height: 56, backgroundColor: 'white', justifyContent: 'space-between', flexDirection: 'row' }}>
                            <Text>{item.key}</Text>
                            <TouchableOpacity style={{ width: 56, height: 56, backgroundColor: Colors.red40 }} onPress={() => {
                                alert('删除')
                            }}>
                                <Text>删除</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </View>
        )
    }
}

export default FoldManagerPage