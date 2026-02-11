import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import client from '../api/client';

export default function HomeScreen({ navigation }) {
    const [recording, setRecording] = useState();
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [processing, setProcessing] = useState(false);
    const [lastIntent, setLastIntent] = useState(null);

    async function startRecording() {
        try {
            if (permissionResponse.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        console.log('Stopping recording..');
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);
        uploadAudio(uri);
    }

    async function uploadAudio(uri) {
        setProcessing(true);
        const formData = new FormData();
        formData.append('audio', {
            uri: uri,
            name: 'voice_command.m4a',
            type: 'audio/m4a',
        });

        try {
            // Adjust headers for multipart
            const response = await client.post('/voice/command', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log('Voice command processed:', response.data);
            setLastIntent(response.data.data);
            Alert.alert('Command Recognized', JSON.stringify(response.data.data, null, 2));

        } catch (error) {
            console.error('Voice upload failed:', error);
            Alert.alert('Error', 'Failed to process voice command.');
        } finally {
            setProcessing(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Student Productivity</Text>

            <View style={styles.widgetContainer}>
                <Text style={styles.widgetText}>One-Tap Voice Widget</Text>

                {processing ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <TouchableOpacity
                        style={[styles.recordButton, recording ? styles.recording : null]}
                        onPress={recording ? stopRecording : startRecording}
                    >
                        <Text style={styles.recordButtonText}>
                            {recording ? 'Stop & Send' : 'Tap to Speak'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {lastIntent && (
                <View style={styles.intentContainer}>
                    <Text style={styles.intentTitle}>Last Command:</Text>
                    <Text>Intent: {lastIntent.intent}</Text>
                    <Text>Task: {lastIntent.task_name}</Text>
                    {lastIntent.new_date && <Text>Date: {lastIntent.new_date}</Text>}
                </View>
            )}

            <View style={styles.actionContainer}>
                <Button
                    title="Upload Syllabus"
                    onPress={() => navigation.navigate('Syllabus')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    widgetContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#fff',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    widgetText: {
        fontSize: 18,
        marginBottom: 20,
        fontWeight: '600',
        color: '#333',
    },
    recordButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#007AFF', // Blue
        alignItems: 'center',
        justifyContent: 'center',
    },
    recording: {
        backgroundColor: '#FF3B30', // Red
    },
    recordButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    actionContainer: {
        width: '100%',
    },
    intentContainer: {
        marginTop: 20,
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
        width: '100%',
    },
    intentTitle: {
        fontWeight: 'bold',
    }
});
