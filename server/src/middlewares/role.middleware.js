/**
 * Role-Based Authorization Middleware
 * Restricts access based on user roles
 */

/**
 * Allow specific roles
 * @param {...string} roles - Allowed roles (patient, helper, admin)
 */
const allowRoles = (...roles) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // Check if user role is allowed
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This resource requires one of the following roles: ${roles.join(', ')}.`,
                requiredRoles: roles,
                userRole: req.user.role
            });
        }

        next();
    };
};

/**
 * Require Patient Role
 */
const requirePatient = allowRoles('patient');

/**
 * Require Helper Role
 */
const requireHelper = allowRoles('helper');

/**
 * Require Admin Role
 */
const requireAdmin = allowRoles('admin');

/**
 * Require Patient or Helper
 */
const requirePatientOrHelper = allowRoles('patient', 'helper');

/**
 * Require Helper or Admin
 */
const requireHelperOrAdmin = allowRoles('helper', 'admin');

/**
 * Check if user owns the resource
 * For patient-specific routes
 */
const requireOwnership = (resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            // Admin has access to everything
            if (req.user.role === 'admin') {
                return next();
            }

            const resourceId = req.params[resourceIdParam];

            // For patients, check if they own the resource
            if (req.user.role === 'patient') {
                const { Patient } = require('../models');
                const patient = await Patient.findOne({ userId: req.user.userId });

                if (!patient) {
                    return res.status(404).json({
                        success: false,
                        message: 'Patient profile not found.'
                    });
                }

                // Check if resource belongs to patient
                if (resourceId && resourceId !== patient._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. You can only access your own resources.'
                    });
                }

                // Attach patient ID to request for convenience
                req.patientId = patient._id;
            }

            // For helpers, check if patient is assigned to them
            if (req.user.role === 'helper') {
                const { Helper, Patient } = require('../models');
                const helper = await Helper.findOne({ userId: req.user.userId });

                if (!helper) {
                    return res.status(404).json({
                        success: false,
                        message: 'Helper profile not found.'
                    });
                }

                // Check if patient is assigned to helper
                if (resourceId) {
                    const patient = await Patient.findById(resourceId);

                    if (!patient) {
                        return res.status(404).json({
                            success: false,
                            message: 'Patient not found.'
                        });
                    }

                    if (patient.helperId?.toString() !== helper._id.toString()) {
                        return res.status(403).json({
                            success: false,
                            message: 'Access denied. This patient is not assigned to you.'
                        });
                    }
                }

                // Attach helper ID to request
                req.helperId = helper._id;
            }

            next();
        } catch (error) {
            console.error('Ownership check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking resource ownership.'
            });
        }
    };
};

/**
 * Restrict helpers to read-only access
 * Blocks POST, PUT, PATCH, DELETE for helpers
 */
const helperReadOnly = (req, res, next) => {
    if (req.user.role === 'helper' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Helpers have read-only access.'
        });
    }
    next();
};

module.exports = {
    allowRoles,
    requirePatient,
    requireHelper,
    requireAdmin,
    requirePatientOrHelper,
    requireHelperOrAdmin,
    requireOwnership,
    helperReadOnly
};
