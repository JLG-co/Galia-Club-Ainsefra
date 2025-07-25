from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime
import json
from network_discovery import NetworkDiscovery
from sync_manager import SyncManager
import threading

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='../frontend/build')
CORS(app)

# Database configuration
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'galia_club')

try:
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    print(f"Connected to MongoDB: {DB_NAME}")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    db = None

# Initialize sync manager
sync_manager = None
if db:
    sync_manager = SyncManager(db)
    sync_manager.start()

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# API Routes

# Athletes
@app.route('/api/athletes', methods=['GET'])
def get_athletes():
    try:
        athletes = list(db.athletes.find({}, {'_id': 0}))
        return jsonify(athletes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/athletes', methods=['POST'])
def add_athlete():
    try:
        athlete_data = request.json
        athlete_data['created_at'] = datetime.now().isoformat()
        athlete_data['updated_at'] = datetime.now().isoformat()
        
        db.athletes.insert_one(athlete_data)
        
        # Trigger sync
        if sync_manager:
            sync_manager.force_sync()
        
        return jsonify({'message': 'Athlete added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/athletes/<athlete_id>', methods=['PUT'])
def update_athlete(athlete_id):
    try:
        athlete_data = request.json
        athlete_data['updated_at'] = datetime.now().isoformat()
        
        result = db.athletes.update_one(
            {'id': athlete_id},
            {'$set': athlete_data}
        )
        
        if result.modified_count > 0:
            # Trigger sync
            if sync_manager:
                sync_manager.force_sync()
            return jsonify({'message': 'Athlete updated successfully'})
        else:
            return jsonify({'error': 'Athlete not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/athletes/<athlete_id>', methods=['DELETE'])
def delete_athlete(athlete_id):
    try:
        result = db.athletes.delete_one({'id': athlete_id})
        
        if result.deleted_count > 0:
            # Trigger sync
            if sync_manager:
                sync_manager.force_sync()
            return jsonify({'message': 'Athlete deleted successfully'})
        else:
            return jsonify({'error': 'Athlete not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Coaches
@app.route('/api/coaches', methods=['GET'])
def get_coaches():
    try:
        coaches = list(db.coaches.find({}, {'_id': 0}))
        return jsonify(coaches)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/coaches', methods=['POST'])
def add_coach():
    try:
        coach_data = request.json
        coach_data['created_at'] = datetime.now().isoformat()
        coach_data['updated_at'] = datetime.now().isoformat()
        
        db.coaches.insert_one(coach_data)
        
        # Trigger sync
        if sync_manager:
            sync_manager.force_sync()
        
        return jsonify({'message': 'Coach added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Groups
@app.route('/api/groups', methods=['GET'])
def get_groups():
    try:
        groups = list(db.groups.find({}, {'_id': 0}))
        return jsonify(groups)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/groups', methods=['POST'])
def add_group():
    try:
        group_data = request.json
        group_data['created_at'] = datetime.now().isoformat()
        group_data['updated_at'] = datetime.now().isoformat()
        
        db.groups.insert_one(group_data)
        
        # Trigger sync
        if sync_manager:
            sync_manager.force_sync()
        
        return jsonify({'message': 'Group added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Payments
@app.route('/api/payments', methods=['GET'])
def get_payments():
    try:
        payments = list(db.payments.find({}, {'_id': 0}))
        return jsonify(payments)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/payments', methods=['POST'])
def add_payment():
    try:
        payment_data = request.json
        payment_data['created_at'] = datetime.now().isoformat()
        payment_data['updated_at'] = datetime.now().isoformat()
        
        db.payments.insert_one(payment_data)
        
        # Trigger sync
        if sync_manager:
            sync_manager.force_sync()
        
        return jsonify({'message': 'Payment added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Sync API Routes
@app.route('/api/sync/status', methods=['GET'])
def get_sync_status():
    try:
        if sync_manager:
            status = sync_manager.get_sync_status()
            return jsonify(status)
        else:
            return jsonify({'error': 'Sync manager not available'}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sync/force', methods=['POST'])
def force_sync():
    try:
        if sync_manager:
            result = sync_manager.force_sync()
            return jsonify({
                'message': 'Sync initiated',
                'results': result,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'Sync manager not available'}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sync/devices', methods=['GET'])
def get_discovered_devices():
    try:
        if sync_manager:
            devices = sync_manager.discovery.get_devices()
            return jsonify(list(devices.values()))
        else:
            return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected' if db else 'disconnected',
        'sync_manager': 'active' if sync_manager else 'inactive'
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)