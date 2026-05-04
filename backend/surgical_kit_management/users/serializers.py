from rest_framework import serializers
from django.contrib.auth import get_user_model
import re

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'password', 'role')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain lowercase letters.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain uppercase letters.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password must contain numbers.")
        return value

    def validate_name(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Name must be at least 3 characters.")
        if re.search(r'\d', value):
            raise serializers.ValidationError("Name cannot contain numbers.")
        return value

    def validate_role(self, value):
        valid_roles = ['doctor', 'nurse', 'admin']
        if value not in valid_roles:
            raise serializers.ValidationError(f"Role must be one of: {', '.join(valid_roles)}")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data.get('name', ''),
            role=validated_data.get('role', 'nurse')
        )
        return user