#!/usr/bin/env python3

"""
STARGUARD ML Service Health Check
Verifies ML service is running and responsive
"""

import sys
import requests
import json
from typing import Dict, Any

def check_ml_service() -> Dict[str, Any]:
    """Check if ML service is healthy"""
    try:
        response = requests.get('http://localhost:5000/health', timeout=10)
        
        if response.status_code == 200:
            return {
                'status': 'healthy',
                'statusCode': response.status_code,
                'response': response.json()
            }
        else:
            return {
                'status': 'unhealthy',
                'statusCode': response.status_code,
                'error': f'HTTP {response.status_code}'
            }
    except requests.exceptions.RequestException as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }

def main():
    """Main health check function"""
    print('🔬 STARGUARD ML Service Health Check...')
    
    result = check_ml_service()
    
    if result['status'] == 'healthy':
        print(f'✅ ML Service: {result["status"]}')
        print('🧠 ML Service is operational!')
        sys.exit(0)
    else:
        print(f'❌ ML Service: {result["status"]} - {result.get("error", "Unknown error")}')
        print('⚠️  ML Service is unhealthy')
        sys.exit(1)

if __name__ == '__main__':
    main()