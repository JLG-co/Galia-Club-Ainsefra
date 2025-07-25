import socket
import threading
import json
import time
from datetime import datetime
import netifaces
import subprocess
import platform

class NetworkDiscovery:
    def __init__(self, port=8889):
        self.port = port
        self.devices = {}
        self.running = False
        self.sync_data = {}
        
    def get_local_ip(self):
        """Get the local IP address"""
        try:
            # Get default gateway interface
            gateways = netifaces.gateways()
            default_interface = gateways['default'][netifaces.AF_INET][1]
            addresses = netifaces.ifaddresses(default_interface)
            return addresses[netifaces.AF_INET][0]['addr']
        except:
            # Fallback method
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            try:
                s.connect(('8.8.8.8', 80))
                ip = s.getsockname()[0]
            except:
                ip = '127.0.0.1'
            finally:
                s.close()
            return ip
    
    def discover_devices(self):
        """Discover devices on local network"""
        local_ip = self.get_local_ip()
        network = '.'.join(local_ip.split('.')[:-1]) + '.'
        
        def ping_host(ip):
            try:
                if platform.system().lower() == 'windows':
                    result = subprocess.run(['ping', '-n', '1', '-w', '1000', ip], 
                                          capture_output=True, text=True)
                else:
                    result = subprocess.run(['ping', '-c', '1', '-W', '1', ip], 
                                          capture_output=True, text=True)
                
                if result.returncode == 0:
                    # Try to connect to our service port
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(0.5)
                    try:
                        result = sock.connect_ex((ip, self.port))
                        if result == 0:
                            self.devices[ip] = {
                                'ip': ip,
                                'last_seen': datetime.now().isoformat(),
                                'status': 'active'
                            }
                    except:
                        pass
                    finally:
                        sock.close()
            except:
                pass
        
        # Scan network range
        threads = []
        for i in range(1, 255):
            ip = network + str(i)
            if ip != local_ip:
                thread = threading.Thread(target=ping_host, args=(ip,))
                threads.append(thread)
                thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
    
    def start_server(self):
        """Start the discovery server"""
        self.running = True
        
        def server():
            server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server_socket.bind(('0.0.0.0', self.port))
            server_socket.listen(5)
            
            while self.running:
                try:
                    server_socket.settimeout(1.0)
                    client_socket, addr = server_socket.accept()
                    thread = threading.Thread(target=self.handle_client, args=(client_socket, addr))
                    thread.start()
                except socket.timeout:
                    continue
                except:
                    break
            
            server_socket.close()
        
        thread = threading.Thread(target=server)
        thread.daemon = True
        thread.start()
    
    def handle_client(self, client_socket, addr):
        """Handle incoming client connections"""
        try:
            data = client_socket.recv(1024).decode('utf-8')
            if data:
                message = json.loads(data)
                
                if message['type'] == 'discovery':
                    response = {
                        'type': 'discovery_response',
                        'device_info': {
                            'ip': self.get_local_ip(),
                            'name': socket.gethostname(),
                            'timestamp': datetime.now().isoformat(),
                            'app': 'Galia Club Manager'
                        }
                    }
                    client_socket.send(json.dumps(response).encode('utf-8'))
                
                elif message['type'] == 'sync_request':
                    response = {
                        'type': 'sync_data',
                        'data': self.sync_data,
                        'timestamp': datetime.now().isoformat()
                    }
                    client_socket.send(json.dumps(response).encode('utf-8'))
                
                elif message['type'] == 'sync_update':
                    self.sync_data.update(message['data'])
                    response = {
                        'type': 'sync_acknowledged',
                        'timestamp': datetime.now().isoformat()
                    }
                    client_socket.send(json.dumps(response).encode('utf-8'))
        
        except Exception as e:
            print(f"Error handling client {addr}: {e}")
        finally:
            client_socket.close()
    
    def sync_with_device(self, device_ip, data):
        """Synchronize data with a specific device"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((device_ip, self.port))
            
            message = {
                'type': 'sync_update',
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
            
            sock.send(json.dumps(message).encode('utf-8'))
            response = sock.recv(1024).decode('utf-8')
            return json.loads(response)
        
        except Exception as e:
            print(f"Error syncing with {device_ip}: {e}")
            return None
        finally:
            sock.close()
    
    def get_devices(self):
        """Get list of discovered devices"""
        return self.devices
    
    def update_sync_data(self, data):
        """Update local sync data"""
        self.sync_data.update(data)
    
    def stop(self):
        """Stop the discovery service"""
        self.running = False