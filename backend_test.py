#!/usr/bin/env python3
"""
Backend API Testing for Galia Club Ain Sefra Karate Management System
Tests all key endpoints and business logic
"""

import requests
import json
from datetime import datetime, timedelta
import uuid
import sys

# Get backend URL from environment
BACKEND_URL = "https://ed1e900f-b4f2-48fd-999d-4e979e30eebc.preview.emergentagent.com/api"

class KarateClubAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_athletes = []
        self.created_coaches = []
        self.created_groups = []
        self.created_payments = []
        
    def log_test(self, test_name, success, message="", data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "data": data
        })
        
    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/dashboard")
            if response.status_code == 200:
                data = response.json()
                required_fields = [
                    'total_athletes', 'active_athletes', 'total_coaches', 
                    'total_groups', 'pending_payments', 'overdue_payments',
                    'monthly_revenue', 'yearly_license_revenue'
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_test("Dashboard Stats API", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Dashboard Stats API", True, f"All stats returned correctly", data)
            else:
                self.log_test("Dashboard Stats API", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Dashboard Stats API", False, f"Exception: {str(e)}")
    
    def test_create_athlete(self):
        """Test athlete creation with automatic payment generation"""
        try:
            athlete_data = {
                "first_name": "Ahmed",
                "last_name": "Benali",
                "date_of_birth": "2010-05-15T00:00:00Z",
                "gender": "male",
                "phone": "0555123456",
                "parent_phone": "0555987654",
                "address": "Ain Sefra, Algeria",
                "belt_level": "White"
            }
            
            response = self.session.post(f"{self.base_url}/athletes", json=athlete_data)
            if response.status_code == 200:
                athlete = response.json()
                self.created_athletes.append(athlete['id'])
                
                # Verify athlete data
                if athlete['first_name'] == athlete_data['first_name'] and athlete['last_name'] == athlete_data['last_name']:
                    self.log_test("Create Athlete", True, f"Athlete created successfully: {athlete['first_name']} {athlete['last_name']}", athlete)
                    
                    # Test automatic payment generation
                    self.test_automatic_payments(athlete['id'])
                else:
                    self.log_test("Create Athlete", False, "Athlete data mismatch")
            else:
                self.log_test("Create Athlete", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Create Athlete", False, f"Exception: {str(e)}")
    
    def test_automatic_payments(self, athlete_id):
        """Test that payments are automatically created for new athletes"""
        try:
            response = self.session.get(f"{self.base_url}/payments", params={"athlete_id": athlete_id})
            if response.status_code == 200:
                payments = response.json()
                
                # Should have 2 payments: monthly (500 DZD) and yearly license (300 DZD)
                if len(payments) == 2:
                    monthly_payment = next((p for p in payments if p['payment_type'] == 'monthly'), None)
                    yearly_payment = next((p for p in payments if p['payment_type'] == 'yearly_license'), None)
                    
                    if monthly_payment and yearly_payment:
                        if monthly_payment['amount'] == 500.0 and yearly_payment['amount'] == 300.0:
                            self.log_test("Automatic Payment Generation", True, "Both monthly (500 DZD) and yearly license (300 DZD) payments created")
                        else:
                            self.log_test("Automatic Payment Generation", False, f"Incorrect amounts: monthly={monthly_payment['amount']}, yearly={yearly_payment['amount']}")
                    else:
                        self.log_test("Automatic Payment Generation", False, "Missing payment types")
                else:
                    self.log_test("Automatic Payment Generation", False, f"Expected 2 payments, got {len(payments)}")
            else:
                self.log_test("Automatic Payment Generation", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Automatic Payment Generation", False, f"Exception: {str(e)}")
    
    def test_get_athletes(self):
        """Test retrieving all athletes"""
        try:
            response = self.session.get(f"{self.base_url}/athletes")
            if response.status_code == 200:
                athletes = response.json()
                self.log_test("Get All Athletes", True, f"Retrieved {len(athletes)} athletes")
                
                # Test active only filter
                response_active = self.session.get(f"{self.base_url}/athletes", params={"active_only": True})
                if response_active.status_code == 200:
                    active_athletes = response_active.json()
                    self.log_test("Get Active Athletes", True, f"Retrieved {len(active_athletes)} active athletes")
                else:
                    self.log_test("Get Active Athletes", False, f"HTTP {response_active.status_code}")
            else:
                self.log_test("Get All Athletes", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get All Athletes", False, f"Exception: {str(e)}")
    
    def test_get_specific_athlete(self):
        """Test retrieving specific athlete"""
        if not self.created_athletes:
            self.log_test("Get Specific Athlete", False, "No athletes created to test with")
            return
            
        try:
            athlete_id = self.created_athletes[0]
            response = self.session.get(f"{self.base_url}/athletes/{athlete_id}")
            if response.status_code == 200:
                athlete = response.json()
                self.log_test("Get Specific Athlete", True, f"Retrieved athlete: {athlete['first_name']} {athlete['last_name']}")
            else:
                self.log_test("Get Specific Athlete", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Specific Athlete", False, f"Exception: {str(e)}")
    
    def test_update_athlete(self):
        """Test updating athlete information"""
        if not self.created_athletes:
            self.log_test("Update Athlete", False, "No athletes created to test with")
            return
            
        try:
            athlete_id = self.created_athletes[0]
            update_data = {
                "belt_level": "Yellow",
                "phone": "0555999888"
            }
            
            response = self.session.put(f"{self.base_url}/athletes/{athlete_id}", json=update_data)
            if response.status_code == 200:
                updated_athlete = response.json()
                if updated_athlete['belt_level'] == "Yellow" and updated_athlete['phone'] == "0555999888":
                    self.log_test("Update Athlete", True, "Athlete updated successfully")
                else:
                    self.log_test("Update Athlete", False, "Update data not reflected")
            else:
                self.log_test("Update Athlete", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Update Athlete", False, f"Exception: {str(e)}")
    
    def test_create_coach(self):
        """Test coach creation"""
        try:
            coach_data = {
                "first_name": "Karim",
                "last_name": "Messaoudi",
                "phone": "0555111222",
                "specialization": "Kumite",
                "experience_years": 8,
                "belt_level": "Black Belt 3rd Dan"
            }
            
            response = self.session.post(f"{self.base_url}/coaches", json=coach_data)
            if response.status_code == 200:
                coach = response.json()
                self.created_coaches.append(coach['id'])
                self.log_test("Create Coach", True, f"Coach created: {coach['first_name']} {coach['last_name']}", coach)
            else:
                self.log_test("Create Coach", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Create Coach", False, f"Exception: {str(e)}")
    
    def test_get_coaches(self):
        """Test retrieving all coaches"""
        try:
            response = self.session.get(f"{self.base_url}/coaches")
            if response.status_code == 200:
                coaches = response.json()
                self.log_test("Get All Coaches", True, f"Retrieved {len(coaches)} coaches")
            else:
                self.log_test("Get All Coaches", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get All Coaches", False, f"Exception: {str(e)}")
    
    def test_create_group(self):
        """Test group creation"""
        if not self.created_coaches:
            self.log_test("Create Group", False, "No coaches created to test with")
            return
            
        try:
            group_data = {
                "name": "Beginners Group A",
                "coach_id": self.created_coaches[0],
                "max_capacity": 15,
                "schedule": "Monday, Wednesday, Friday 16:00-17:30"
            }
            
            response = self.session.post(f"{self.base_url}/groups", json=group_data)
            if response.status_code == 200:
                group = response.json()
                self.created_groups.append(group['id'])
                self.log_test("Create Group", True, f"Group created: {group['name']}", group)
            else:
                self.log_test("Create Group", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Create Group", False, f"Exception: {str(e)}")
    
    def test_get_groups(self):
        """Test retrieving all groups"""
        try:
            response = self.session.get(f"{self.base_url}/groups")
            if response.status_code == 200:
                groups = response.json()
                self.log_test("Get All Groups", True, f"Retrieved {len(groups)} groups")
            else:
                self.log_test("Get All Groups", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get All Groups", False, f"Exception: {str(e)}")
    
    def test_add_athlete_to_group(self):
        """Test adding athlete to group and capacity limits"""
        if not self.created_athletes or not self.created_groups:
            self.log_test("Add Athlete to Group", False, "No athletes or groups created to test with")
            return
            
        try:
            athlete_id = self.created_athletes[0]
            group_id = self.created_groups[0]
            
            response = self.session.post(f"{self.base_url}/groups/{group_id}/add-athlete/{athlete_id}")
            if response.status_code == 200:
                self.log_test("Add Athlete to Group", True, "Athlete added to group successfully")
                
                # Verify group count updated
                group_response = self.session.get(f"{self.base_url}/groups")
                if group_response.status_code == 200:
                    groups = group_response.json()
                    updated_group = next((g for g in groups if g['id'] == group_id), None)
                    if updated_group and updated_group['current_count'] == 1:
                        self.log_test("Group Count Update", True, "Group current_count updated correctly")
                    else:
                        self.log_test("Group Count Update", False, "Group current_count not updated")
            else:
                self.log_test("Add Athlete to Group", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Add Athlete to Group", False, f"Exception: {str(e)}")
    
    def test_create_payment(self):
        """Test manual payment creation"""
        if not self.created_athletes:
            self.log_test("Create Payment", False, "No athletes created to test with")
            return
            
        try:
            payment_data = {
                "athlete_id": self.created_athletes[0],
                "payment_type": "monthly"
            }
            
            response = self.session.post(f"{self.base_url}/payments", json=payment_data)
            if response.status_code == 200:
                payment = response.json()
                self.created_payments.append(payment['id'])
                if payment['amount'] == 500.0 and payment['payment_type'] == 'monthly':
                    self.log_test("Create Payment", True, f"Payment created: {payment['amount']} DZD", payment)
                else:
                    self.log_test("Create Payment", False, "Payment data incorrect")
            else:
                self.log_test("Create Payment", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Create Payment", False, f"Exception: {str(e)}")
    
    def test_get_payments(self):
        """Test retrieving payments with filtering"""
        try:
            # Get all payments
            response = self.session.get(f"{self.base_url}/payments")
            if response.status_code == 200:
                payments = response.json()
                self.log_test("Get All Payments", True, f"Retrieved {len(payments)} payments")
                
                # Test filtering by status
                pending_response = self.session.get(f"{self.base_url}/payments", params={"status": "pending"})
                if pending_response.status_code == 200:
                    pending_payments = pending_response.json()
                    self.log_test("Get Pending Payments", True, f"Retrieved {len(pending_payments)} pending payments")
                else:
                    self.log_test("Get Pending Payments", False, f"HTTP {pending_response.status_code}")
            else:
                self.log_test("Get All Payments", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get All Payments", False, f"Exception: {str(e)}")
    
    def test_mark_payment_as_paid(self):
        """Test marking payment as paid"""
        if not self.created_payments:
            # Try to get any existing payment
            try:
                response = self.session.get(f"{self.base_url}/payments")
                if response.status_code == 200:
                    payments = response.json()
                    if payments:
                        payment_id = payments[0]['id']
                    else:
                        self.log_test("Mark Payment as Paid", False, "No payments available to test with")
                        return
                else:
                    self.log_test("Mark Payment as Paid", False, "Could not retrieve payments")
                    return
            except:
                self.log_test("Mark Payment as Paid", False, "No payments created to test with")
                return
        else:
            payment_id = self.created_payments[0]
            
        try:
            response = self.session.put(f"{self.base_url}/payments/{payment_id}/pay")
            if response.status_code == 200:
                self.log_test("Mark Payment as Paid", True, "Payment marked as paid successfully")
            else:
                self.log_test("Mark Payment as Paid", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Mark Payment as Paid", False, f"Exception: {str(e)}")
    
    def test_get_overdue_payments(self):
        """Test retrieving overdue payments"""
        try:
            response = self.session.get(f"{self.base_url}/payments/overdue")
            if response.status_code == 200:
                overdue_payments = response.json()
                self.log_test("Get Overdue Payments", True, f"Retrieved {len(overdue_payments)} overdue payments")
            else:
                self.log_test("Get Overdue Payments", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Overdue Payments", False, f"Exception: {str(e)}")
    
    def test_deactivate_athlete(self):
        """Test athlete deactivation"""
        if not self.created_athletes:
            self.log_test("Deactivate Athlete", False, "No athletes created to test with")
            return
            
        try:
            athlete_id = self.created_athletes[0]
            response = self.session.delete(f"{self.base_url}/athletes/{athlete_id}")
            if response.status_code == 200:
                # Verify athlete is deactivated
                athlete_response = self.session.get(f"{self.base_url}/athletes/{athlete_id}")
                if athlete_response.status_code == 200:
                    athlete = athlete_response.json()
                    if not athlete['is_active']:
                        self.log_test("Deactivate Athlete", True, "Athlete deactivated successfully")
                    else:
                        self.log_test("Deactivate Athlete", False, "Athlete still active after deactivation")
                else:
                    self.log_test("Deactivate Athlete", False, "Could not verify deactivation")
            else:
                self.log_test("Deactivate Athlete", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Deactivate Athlete", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 80)
        print("GALIA CLUB AIN SEFRA KARATE MANAGEMENT SYSTEM - BACKEND API TESTS")
        print("=" * 80)
        print(f"Testing backend at: {self.base_url}")
        print()
        
        # Test sequence following the business flow
        print("🏁 Starting Dashboard Tests...")
        self.test_dashboard_stats()
        print()
        
        print("👥 Starting Athletes Management Tests...")
        self.test_create_athlete()
        self.test_get_athletes()
        self.test_get_specific_athlete()
        self.test_update_athlete()
        print()
        
        print("🥋 Starting Coaches Management Tests...")
        self.test_create_coach()
        self.test_get_coaches()
        print()
        
        print("👨‍👩‍👧‍👦 Starting Groups Management Tests...")
        self.test_create_group()
        self.test_get_groups()
        self.test_add_athlete_to_group()
        print()
        
        print("💰 Starting Payments Management Tests...")
        self.test_create_payment()
        self.test_get_payments()
        self.test_mark_payment_as_paid()
        self.test_get_overdue_payments()
        print()
        
        print("🗑️ Starting Cleanup Tests...")
        self.test_deactivate_athlete()
        print()
        
        # Summary
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        print()
        
        if failed > 0:
            print("FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"❌ {result['test']}: {result['message']}")
            print()
        
        print("CRITICAL BUSINESS LOGIC VERIFICATION:")
        auto_payment_test = next((r for r in self.test_results if r['test'] == 'Automatic Payment Generation'), None)
        if auto_payment_test and auto_payment_test['success']:
            print("✅ Automatic payment generation (500 DZD monthly + 300 DZD yearly) working correctly")
        else:
            print("❌ CRITICAL: Automatic payment generation not working properly")
        
        group_capacity_test = next((r for r in self.test_results if r['test'] == 'Group Count Update'), None)
        if group_capacity_test and group_capacity_test['success']:
            print("✅ Group capacity tracking working correctly")
        else:
            print("❌ Group capacity tracking may have issues")
        
        return failed == 0

if __name__ == "__main__":
    tester = KarateClubAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)