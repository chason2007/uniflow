import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import client from '../api/client';

export default function SyllabusScreen() {
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState([]);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
            });

            if (result.assets && result.assets.length > 0) {
                uploadSyllabus(result.assets[0]);
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const uploadSyllabus = async (file) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('syllabus', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/pdf',
        });

        try {
            // Note: We need to change Content-Type for this specific request to let axios set the boundary
            const response = await client.post('/syllabus/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload success:', response.data);
            setTasks(response.data.tasks || []);
            Alert.alert('Success', 'Syllabus processed!');
        } catch (err) {
            console.error('Upload error:', err);
            Alert.alert('Error', 'Failed to upload syllabus');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Syllabus Brain</Text>
            <Text style={styles.subtitle}>Upload your PDF syllabus to extract tasks automatically.</Text>

            <View style={styles.buttonContainer}>
                <Button title="Select PDF Syllabus" onPress={pickDocument} disabled={loading} />
            </View>

            {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

            {tasks.length > 0 && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Extracted Tasks:</Text>
                    {tasks.map((task, index) => (
                        <View key={index} style={styles.taskItem}>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            <Text>{task.date} - {task.category}</Text>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    buttonContainer: {
        marginBottom: 20,
    },
    loader: {
        marginTop: 20,
    },
    resultContainer: {
        marginTop: 20,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    taskItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    taskTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});
