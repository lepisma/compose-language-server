;;; lsp-compose.el --- lsp-mode client for compose server -*- lexical-binding: t; -*-

;; Copyright (c) 2020 Abhinav Tushar

;; Author: Abhinav Tushar <abhinav@lepisma.xyz>
;; Version: 0.0.1
;; Package-Requires: ((emacs "26"))
;; URL: https://github.com/lepisma/compose-language-server.el

;;; Commentary:

;; lsp-mode client for compose server
;; This file is not a part of GNU Emacs.

;;; License:

;; This program is free software: you can redistribute it and/or modify
;; it under the terms of the GNU General Public License as published by
;; the Free Software Foundation, either version 3 of the License, or
;; (at your option) any later version.

;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
;; GNU General Public License for more details.

;; You should have received a copy of the GNU General Public License
;; along with this program. If not, see <http://www.gnu.org/licenses/>.

;;; Code:

(require 'lsp-mode)

(defgroup lsp-compose nil
  "Language Server Protocol client for compose server."
  :group 'lsp-mode)

(defun lsp-compose-command ()
  "Return command to run for the server."
  (list "node" "./out/server.js" "--stdio"))

(add-to-list 'lsp-language-id-configuration '(org-mode . "compose"))

(lsp-register-client
 (make-lsp-client
  :new-connection (lsp-stdio-connection #'lsp-compose-command)
  :major-modes '(org-mode)
  :server-id 'compose-ls))

(provide 'lsp-compose)

;;; lsp-compose.el ends here
