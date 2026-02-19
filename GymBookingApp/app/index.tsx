import { CapacityRing } from '@/components/CapacityRing';
import { gymService } from '@/services/api';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GYM_ID = 'gym_1';
const USER_ID = 'user_99'; 

export default function GymBookingScreen() {
  const [capacity, setCapacity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCapacity = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gymService.getCapacity(GYM_ID);
      setCapacity(data.capacityPercentage);
    } catch (err) {
      setError('Failed to load gym data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapacity();
    const interval = setInterval(fetchCapacity, 30000); 
    return () => clearInterval(interval);
  }, []);

  const handleBook = async () => {
    try {
      setBooking(true);
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const slotTime = futureDate.toISOString(); 
      
      await gymService.bookSlot(GYM_ID, USER_ID, slotTime);
      
      Alert.alert('Success', 'Your workout slot is confirmed!', [
        { text: 'Great', onPress: fetchCapacity }
      ]);
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message || 'Something went wrong');
    } finally {
      setBooking(false);
    }
  };

  if (loading && capacity === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Gym Stats...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Downtown Iron</Text>
        <Text style={styles.subtitle}>Peak Hours Booking</Text>
      </View>

      <View style={styles.content}>
        <CapacityRing percentage={capacity ?? 0} />
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Status</Text>
          <Text style={[styles.statusLine, { color: (capacity ?? 0) > 80 ? '#FF4B4B' : '#4CAF50' }]}>
            {(capacity ?? 0) > 80 ? 'Busy - Booking Recommended' : 'Optimal - Plenty of Space'}
          </Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity 
          style={[
            styles.button, 
            (booking || (capacity ?? 0) >= 100) && styles.buttonDisabled
          ]} 
          onPress={handleBook}
          disabled={booking || (capacity ?? 0) >= 100}
        >
          {booking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {(capacity ?? 0) >= 100 ? 'Gym is Full' : 'Book Workout Slot'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.refreshButton} onPress={fetchCapacity}>
          <Text style={styles.refreshText}>Refresh Status</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centered: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginTop: 40,
    alignItems: 'center',
  },
  infoTitle: {
    color: '#888',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusLine: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  button: {
    width: '100%',
    backgroundColor: '#4CAF50',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#2E4C2F',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    marginTop: 20,
    padding: 10,
  },
  refreshText: {
    color: '#888',
    fontSize: 14,
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#FF4B4B',
    marginTop: 16,
  }
});
